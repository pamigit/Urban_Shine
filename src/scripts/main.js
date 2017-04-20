
//ako nije logovan user ili admin vracamo se na pocetnu stranu index
if (sessionStorage.getItem("logovan") != "true") {
	location.href = "index.html";
}

var tot = 0; //Ukupna vrednost korpe
var products = []; //niz producta, puni se pri njihovom kreiranju i sa servera pri ucitavanju strane
var basket = [];  //niz producta, puni se i izbacuje pri kupovini
var countItemsInBasket = 0; //brojac za kolicinu itema u basketu
var categories = []; //niz categorija, koji se puni sa servera pri ucitavanju strane
var urlProducts = "http://services.odata.org/V3/Northwind/Northwind.svc/Products?$format=json"; //url servera sa produktima
var urlCategory = "http://services.odata.org/V3/Northwind/Northwind.svc/Categories?$format=json "; //url servera sa kategorijama
var imageNewProduct; //putanja do izabrane slike u modalnoj formi

//GET f-je koje dobijaju podatke o produktima i kategorijama sa odredjenog servera pri ucitavanju strane
$(document).ready(function(){
	
	//ako nije logovan user ili admin vracamo se na pocetnu stranu index
	if (sessionStorage.getItem("logovan") != "true") {
		location.href = "index.html";
	}
	//ispitujemo ko je logovan
	else {
		$("#profileImage").attr("src",sessionStorage.getItem("srcImage"));
		$("#fullNameProfile").html(sessionStorage.getItem("fullName"));
		$("#titleProfile").html(sessionStorage.getItem("title"));
		if (sessionStorage.getItem("type") == "user") {
			$("#btnNewProduct").hide();
			$("#btnCart").show();
			$("#totalSummary").show();
			$("#cart").show();
		}
		if (sessionStorage.getItem("type") == "admin") {
			$("#btnNewProduct").show();
			$("#btnCart").hide();
			$("#totalSummary").hide();
			$("#cart").hide();
		}
		//jquery-ui datapicker
		$("#date").datepicker({
			dateFormat : "DD, d MM, yy"
		});
		//kendo-ui drop-image
		$("#files").kendoUpload({
			async: {
				saveUrl: "save",
				removeUrl: "remove",
				autoUpload: true
			},
			validation: {
				allowedExtensions: [".jpg", ".jpeg", ".png", ".bmp", ".gif"]
			},
			success: onSuccess,
			error: onSuccess,
			showFileList: false,
			dropZone: ".dropZoneElement"
		});

		function onSuccess(e) {
			if (e.operation == "upload") {
				imageNewProduct = "images/" + e.files[e.files.length-1].name;
				$("#selectedProductImage").html("<div class='selectedProductImage'><img src=" + imageNewProduct + " /></div>");
			}
		}
	    //dobijanje informacija o produktima i kategorijama
		$.ajax({
			url: urlProducts,
			dataType: "json",			
			success: function(productsResult){
				$.ajax({
					url: urlCategory,
					dataType: "json",			
					success: function(categoriesResult){
						//niz produkta i niz kategorija
						products = productsResult.value;
						categories = categoriesResult.value;
						//kreiramo produkte sa odgovarajucim atributima i kreiramo dropdown categorije modalne forme
						for(var i in products){
							for (var j in categories) {
								if(products[i].CategoryID == categories[j].CategoryID) {                     
									products[i].CategoryName = categories[j].CategoryName;
								}
							}
							var randomId = Math.round(Math.random() * 6) + 1;
							products[i].imagePath = "images/item" + randomId + ".Jpeg";
							products[i].createDate = new Date().toDateString();
							showNewProduct(products[i]);
						}
						createDropDownCategory(categories);
					},
					error: function(error){
						alert(error.message);
					}
				});
			},
			error: function(error){
				alert(error.message);
			}
		});
	
		//f-ja koja se izvrsava klikom na dugme "Pretrazi", i njena je uloga u filtriranju proizvoda
		$("#btnFilter").click(function() {
			//selektovani drop-down i uneta vrednost u search-u
			var selectedDropDown = $("#categoryList option:selected").text();
			var searchValue = $("#filter").val().toLowerCase();
			
			if(selectedDropDown != "Svi proizvodi"){
				clearAllProducts();
				productsByFilterDropDown = getProductsByCategoryName(selectedDropDown, products);
				if (searchValue != ""){
					productsByFilterSearch = getProductsBySearchValue(searchValue, productsByFilterDropDown);
					for (var i in productsByFilterSearch){
						showNewProduct(productsByFilterSearch[i]);
					}
				}
				else{
					for (var i in productsByFilterDropDown){				
						showNewProduct(productsByFilterDropDown[i]);
					}
				}
			}
			else{
				if (searchValue != ""){
					clearAllProducts();
					productsByFilterSearch = getProductsBySearchValue(searchValue, products);
					for (var i in productsByFilterSearch){
						showNewProduct(productsByFilterSearch[i]);
					}
				}
				else{
					clearAllProducts();
					for (var i in products){
						showNewProduct(products[i]);
					}
				}
			}
		});
	}
});



//konstruktorska f-ja za producte
function Product(id, image, name, price, category, categoryName, date) {
	this.ProductID = id;
	this.imagePath = image;
	this.ProductName = name;
	this.UnitPrice = price;
	this.CategoryID = category;
	this.CategoryName = categoryName;
	this.createDate = date;
	this.productQuantity = ""; 
}

//f-ja koja vraca objekat item iz niza products pod zadatim id-jom
function getIdItemFromProducts(id, products) {
	for (var i in products) {
		if (products[i].ProductID == id) {
			return products[i];
		}
	}
}

//f-ja koja vraca index itema iz niza basket
function getIndexFromBasket(id, basket) {
	var rezult = -1;
	for (var i in basket) {
		if (basket[i].ProductID == id) {
			return i;
		} 
	}
	return rezult;
}

//f-ja iz koje dobijamo id kategorije, na osnovu selektovanog imena
function getCategoryIDByCategoryName(selectedCategory, categories) {
	for (var i in categories) {
		if(categories[i].CategoryName == selectedCategory) {
			return categories[i].CategoryID;
		}
	}
}

//f-ja koja brise sve child-ove u izabranom elementu
function clearAllProducts(){
	$("#containerItems").empty();
}

//f-ja koja vraca niz produkta na osnovu zadatog id-ja
function getProductsByCategoryName(name, products) {
	var result = [];
	for (var i in products){
		if(products[i].CategoryName == name){
			result.push(products[i]);
		}
	}
	return result;
}

//f-ja koja vraca niz produkta na osnovu zadate vrednosti karaktera
function getProductsBySearchValue(searchParam, products) {
	var result = [];
	for (var i in products) {
		if(products[i].ProductName.toLowerCase().indexOf(searchParam) > -1 || products[i].CategoryName.toLowerCase().indexOf(searchParam) > -1){
			result.push(products[i]);
		}
	}
	return result;
}

//f-ja koja dodaje iteme u basket i racuna ukupnu sumu
function addItem(btn) {
	//kreiramo id itema i selektujemo unetu kolicinu
	var btnId = btn.id;
	var idItem = btnId.replace("dodaj","");
	var quantityId = "#kolicina" + idItem;
	var quantity = new Number($(quantityId).val());
	//sve ovo ima smisla raditi kada je uneta kolicina veca od nule
	if (quantity > 0) {
		//selektujemo item iz producta i index iz basketa ukoliko ga ima
		var item = getIdItemFromProducts(idItem, products);
		var index = getIndexFromBasket(idItem, basket);
		
		//ukoliko item ne postoji u basketu
		if (index == -1) {
			item.productQuantity = quantity;
			basket.push(item);
			showCartItem(item, basket.length-1);
		//u slucaju da postoji pridodajemo unetu kolicinu
		} else {
			basket[index].productQuantity += quantity;
			//update-ujemo notify za kolicinu   		
			$("#image" + index).notify("Kolicina: \n" + basket[index].productQuantity, {
				autoHide: false,
				position: "right top",
				className: "success"
			});
		} 
		tot += quantity * Number(item.UnitPrice);
		countItemsInBasket += quantity;
	} else {
		alert("Uneta količina ne može da bude nula ili neka negativna vrednost!");
	}
	$("#suma").text(tot);
	$("#cartSuma").text(tot);
	$("#countItems").text(countItemsInBasket);
}

//f-ja koja izbacuje iteme iz basketa i racuna ukupnu sumu
function throwItem(btn) {
	//kreiramo id itema i selektujemo unetu kolicinu
	var btnId = btn.id;
	var idItem = btnId.replace("izbaci","");
	var quantityId = "#kolicina" + idItem;
	var quantity = new Number($(quantityId).val());
	//sve ovo ima smisla raditi kada je uneta kolicina veca od nule
	if (quantity > 0) {
		var index = getIndexFromBasket(idItem, basket);
		// da li item postoji u basket-u
		if (index == -1) {
			alert("Ne mozete izbaciti proizvod koji niste uneli");
		//da li je kolicina itema u basketu veca nego uneta
		} else if (basket[index].productQuantity < quantity) {
			alert("Ne možete izbaciti vise od unetih proizvoda");
		} else {
			basket[index].productQuantity -= quantity;
			//update-ujemo notify za kolicinu
			$("#image" + index).notify("Kolicina: \n" + basket[index].productQuantity, {
				autoHide: false,
				position: "right top",
				className: "success"
			});
			tot -= quantity * Number(basket[index].UnitPrice);
			countItemsInBasket -= quantity;
			//da li je kolicina itema u basketu jednaka 0
			if (basket[index].productQuantity == 0) {
				$("#" + index).remove();
				basket.splice(index,1);
			}
		}
	} else {
		alert("Uneta količina ne može da bude nula ili neka negativna vrednost!");
	}
	$("#suma").text(tot);
	$("#cartSuma").text(tot);
	$("#countItems").text(countItemsInBasket);
}



//f-ja za kreiranje kategorije za modalnu formu i filter sa servisa
function createDropDownCategory(categories) {
	for (var i in categories) {
		$("<option></option>", {
			value: categories[i].CategoryID,
			text: categories[i].CategoryName
		}).appendTo("#productCategory");
		$("<option></option>", {
			value: categories[i].CategoryID,
			text: categories[i].CategoryName
		}).appendTo("#categoryList");
	}
} 

//f-ja koja validira unete podatke
function validation() {
	var validationNameRequired = document.getElementById("productName");
	var validationMinPrice = document.getElementById("productPrice");
	if (validationNameRequired.checkValidity() == false ) {
		if (validationMinPrice.checkValidity() == false) {
			alert("Error (Naziv proizvoda: " + validationNameRequired.validationMessage + "\n Cena: " + validationMinPrice.validationMessage + ")");
			return false;
		} else {
			alert("Error (Naziv proizvoda: " + validationNameRequired.validationMessage + ")");
			return false;
		}
    } else if (validationMinPrice.checkValidity() == false){
		alert("Error (Cena: " + validationMinPrice.validationMessage + ")");
		return false; 
	} else {
		return true;
	}
}

//f-ja koja kreira nove iteme preko modalne forme i dodaje ih u products
function createNewProduct() {
	//Uzimamo vrednosti iz inputa modala i smestamo ih u promenljivu
	var newProductImage = $("#productImage").val();
	var newProductName = $("#productName").val();
	var newProductPrice = $("#productPrice").val();
    var newProductDate = $("#date").val();                                                                                 
	
	//selektovana kategorija i njen id
	var newProductCategoryName = $("#productCategory option:selected").text();
	var newProductCategoryID = getCategoryIDByCategoryName($("#productCategory").val(), categories);
	
	/*Selektujemo div sa produktima*/
	var productsCatalog = document.getElementById("containerItems");
	/*Novom proizvodu dodeljujemo id kojeg dobijamo iz prethodno selektovanog diva*/
	var newProductId = productsCatalog.childElementCount + 1;
	
	//validacija unetog proizvoda
	if (validation()) {
		//kreiramo nov item
		var newProduct = new Product(newProductId, newProductImage, newProductName, newProductPrice, newProductCategoryID, newProductCategoryName, newProductDate); 
		//tako kreirani se smesta u products
		products.push(newProduct);
		//item se prosledjuje f-ji za prikazivanje
		showNewProduct(newProduct);
	}
}

//f-ja za prikazivanje novog itema na sekciji za kupovinu, gde index predstavlja mesto smestenog proizvoda u korpi
function showCartItem(newProduct, index) {
	//pravimo novi div i smestamo ga u sekciji za kupovinu
	var cartTemplate = $("<div></div>", {
		class: "col-sm-2",
		id: index
	}).appendTo("#cartItems");
	
		var cartImageElement = $("<img/>", {
			id: "image" + index,
			src: newProduct.imagePath,
			class: "img-responsive img-rounded",
			alt: ""
		}).appendTo(cartTemplate);
		cartImageElement.notify("Kolicina :\n" + newProduct.productQuantity, {
			autoHide: false,
			position: "right top",
			className: "success"
		});
		
		var cartNameElement = $("<h4></h4>",{text: newProduct.ProductName}).appendTo(cartTemplate);
		var cartCategoryElement = $("<p></p>",{text: newProduct.CategoryName}).appendTo(cartTemplate);
		
		var cartPriceElement = $("<p></p>",{text: "Cena: "}).appendTo(cartTemplate);
			var cartPriceValueElement = $("<span></span>", {
				id: "item" + newProduct.ProductID,
				text: newProduct.UnitPrice
			}).appendTo(cartPriceElement);
		
		var cartCreateDateElement = $("<p></p>",{text: "Datum kreiranja: "}).appendTo(cartTemplate);
			var cartCreateDate = $("<span></span>",{text: newProduct.createDate}).appendTo(cartCreateDateElement);
			
		var cartQuantityElement = $("<p></p>", {
			class: "inline",
			text: "Količina: "
		}).appendTo(cartTemplate);
		var cartQuantity = $("<input />", {
			type: "number",
			id: "kolicina" + newProduct.ProductID,
			value: "1"
		}).appendTo(cartTemplate);
		
		var breakElement1 = $("<br />").appendTo(cartTemplate);
		var breakElement2 = $("<br />").appendTo(cartTemplate);
		
		var btnDodajElement = $("<button></button>", {
			type: "button",
			id: "dodaj" + newProduct.ProductID,
			onclick: "addItem(this)",
			text: "Dodaj"
		}).appendTo(cartTemplate);
		var btnIzbaciElement = $("<button></button>", {
			type: "button",
			id: "izbaci" + newProduct.ProductID,
			onclick: "throwItem(this)",
			text: "Izbaci"
		}).appendTo(cartTemplate);
		
}



//f-ja za prikazivanje novog itema na sekciji za produkte
function showNewProduct(newProduct){
	/*Pavimo novi div gde cemo ga smestiti u vec postojece produkte*/
	var productTemplate = $("<div></div>",{
		class: "col-sm-4"
	}).appendTo("#containerItems");
		
		/*Sliku novog proizvoda smestamo u novi div dodeljujuci mu src iz inputa*/
		var productImageElement = $("<img/>", {
			src: newProduct.imagePath,
			class: "img-responsive img-rounded",
			alt: ""
		}).appendTo(productTemplate);
		
		/*Ime novog proizvoda smestamo u novi div dodeljujuci mu sadrzaj iz inputa*/
		var productNameElement = $("<h4></h4>",{text: newProduct.ProductName}).appendTo(productTemplate);
		
		/*Kategoriju novog proizvoda smestamo u novi div dodeljujuci mu sadrzaj iz inputa*/
		var productCategoryElement = $("<p></p>",{text: newProduct.CategoryName}).appendTo(productTemplate);
		
		/*Tekst "Cena: " novog proizvoda smestamo u novi div*/
		var productPriceElement = $("<p></p>",{text: "Cena: "}).appendTo(productTemplate);
			/*Cenu i id novog proizvoda smestamo u novi div dodeljujuci mu sadrzaj iz inputa*/
			var productPriceValueElement = $("<span></span>", {
				id: "item" + newProduct.ProductID,
				text: newProduct.UnitPrice
			}).appendTo(productPriceElement);
		
		//Text datuma kreiranja
		var productCreateDateElement = $("<p></p>",{text: "Datum kreiranja: "}).appendTo(productTemplate);
			//Datum kreiranja
			var productCreateDate = $("<span></span>",{text: newProduct.createDate}).appendTo(productCreateDateElement);
		
		//samo useri mogu da kupuju
		if (sessionStorage.getItem("type") == "user") {
			/*Tekst "Kolicina: " novog proizvoda smestamo u novi div*/
			var productQuantityElement = $("<p></p>", {
				class: "inline",
				text: "Količina: "
			}).appendTo(productTemplate);
			
			/* Kolicinu novog proizvoda smestamo u novi div i setujemo mu default-nu vrednost "1" */
			var productQuantity = $("<input />", {
				type: "number",
				id: "kolicina" + newProduct.ProductID,
				value: "1"
			}).appendTo(productTemplate);
			
			/*Elemente br novog proizvoda smestamo u novi div*/
			var breakElement1 = $("<br />").appendTo(productTemplate);
			var breakElement2 = $("<br />").appendTo(productTemplate);
			
			/*Dugme "dodaj" novog proizvoda smestamo u novi div i dodeljujemo mu id */
			var btnDodajElement = $("<button></button>", {
				type: "button",
				id: "dodaj" + newProduct.ProductID,
				onclick: "addItem(this)",
				text: "Dodaj"
			}).appendTo(productTemplate);
			
			/*Dugme "izbaci" novog proizvoda smestamo u novi div i dodeljujemo mu id*/
			var btnIzbaciElement = $("<button></button>", {
				type: "button",
				id: "izbaci" + newProduct.ProductID,
				onclick: "throwItem(this)",
				text: "Izbaci"
			}).appendTo(productTemplate);
		}
		
}

