
var urlEmployees = "http://services.odata.org/V3/Northwind/Northwind.svc/Employees?$format=json";
var employees = [];

//setujemo login usera i admina na false zbog redirekcije na index stranu
sessionStorage.setItem("logovan", false);

$.ajax({
	url: urlEmployees,
	dataType: "json",			
	success: function(employeesResult){
		employees = employeesResult.value;
	},
	error: function(error){
		alert(error.message);
	}
});

//Ispitujemo vrednosti usernamea i passworda nakon klika na dugme Login
function login() {
	//uzimamo vrednosti usernamea i passworda
	var user = $("#user").val();
	var pass = $("#pass").val();
	var employee = getEmployee(user, pass, employees);
	
	if (user == "Pamela" && pass == "Prascevic") {
		redirectUsers();
	} else if (employee != 0) {
		redirectAdmins(employee);
	} else {
		sessionStorage.setItem("logovanAdmin", false);
		sessionStorage.setItem("logovanUser", false);
		alert("Niste uneli ispravan username i password!");
	} 
};

//f-ja koja vraca employea na osnovu imena i prezimena
function getEmployee(first, last, employeesArray) {
	for (var i in employeesArray) {
		var result = 0;
		if (employeesArray[i].FirstName == first && employeesArray[i].LastName == last) {
			return result = employeesArray[i];
		} else {
			return result;
		}
	}
}

//f-ja za redirekciju usera
function redirectUsers() {
	sessionStorage.setItem("logovan", true);
	sessionStorage.setItem("type", "user");
	sessionStorage.setItem("fullName", "Pamela Praščević");
	sessionStorage.setItem("title", "Junior Web Developer");
	sessionStorage.setItem("srcImage", "images/20160627_142656.jpg");
	location.href = "main.html";
}

//f-ja za redirekciju admina
function redirectAdmins(employee) {
	sessionStorage.setItem("logovan", true);
	sessionStorage.setItem("type", "admin");
	sessionStorage.setItem("fullName", employee.FirstName + " " + employee.LastName);
	sessionStorage.setItem("title", employee.Title);
	sessionStorage.setItem("srcImage", "data:image/jpeg;base64," + employee.Photo.substr(104));
	location.href = "main.html";
}