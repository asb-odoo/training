

function additem(product)
{
    var cartlist = document.getElementById("cartlist");
    var cartitem = document.createElement("div");
    cartitem.className = "cartitem";
    cartitem.id = product['id'];

    var itemname = document.createElement("span");
    itemname.id="cartitemname";
    itemname.innerHTML = product['name'];

    var itemprice = document.createElement("span");
    itemprice.id="cartitemprice";
    itemprice.innerHTML = product['price'];

    var removeitem = document.createElement("span");
    removeitem.id="cartitemdelete";

    var anchortag = document.createElement("button");
    anchortag.onclick = function(){
        console.log(product['id']);
        prodid = product['id'];

        var xhr = new XMLHttpRequest();
        var url = '/delitemcart';

        xhr.open('POST', url);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function(){
            if(xhr.readyState==4 && xhr.status==200)
            {
                //Remove the Product
                document.getElementById(prodid).remove();
                //Deduct the total
                console.log(document.getElementById('amount').text);
                document.getElementById('amount').innerHTML = parseInt(document.getElementById('amount').innerHTML) - parseInt(product['price'])
            }
        }
        xhr.send("prodid=" + prodid);
    };
    anchortag.innerHTML = "x";

    removeitem.appendChild(anchortag);

    var carttotalamount = document.getElementById("amount");
    var amount = parseInt(carttotalamount.innerHTML) + parseInt(product['price']);
    carttotalamount.innerHTML = amount; 
    cartitem.appendChild(itemname);
    cartitem.appendChild(itemprice);
    cartitem.appendChild(removeitem);

    cartlist.appendChild(cartitem);
}


function addtocart(product)
{
    cart = document.getElementById('cart');
    if(cart==null){
        // Cart Element doesnot exist
        container = document.getElementById("container");
        var divcart = document.createElement("div");
        divcart.id = "cart";

        var cartheader = document.createElement("h3");
        cartheader.innerHTML = "Your Cart";
        
        var cartlist = document.createElement("div");
        cartlist.id = "cartlist";

        var carttotal = document.createElement("div");
        carttotal.id="carttotal";
        
        var carttotalheader = document.createElement("span");
        carttotalheader.id="cartitemname";
        carttotalheader.innerHTML = "<b>Total</b>"

        var carttotalamount = document.createElement("span");
        carttotalamount.id = "cartitemprice";
        carttotalamount.innerHTML = "<b id='amount'>0</b>";

        carttotal.appendChild(carttotalheader);
        carttotal.appendChild(carttotalamount);
        
        divcart.appendChild(cartheader);
        divcart.appendChild(cartlist);
        divcart.appendChild(carttotal);

        container.appendChild(divcart);
    }
    additem(product);
}

function addtoCartServer(product){

    prodid = product['id'];

    var xhr = new XMLHttpRequest();
    var url = '/addcart';

    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState==4 && xhr.status==200)
        {
            addtocart(product);
        }
    }
    xhr.send("prodid=" + prodid);
}

function displayProducts(products)
{
    var container = document.getElementById('container');

    if(document.getElementById('allproducts')!=null)
    {
        document.getElementById('allproducts').remove();
    }
    
    // Adding Products
    var dispprod = document.createElement("div");
    dispprod.id = "allproducts";
    for(var p in products)
    {
        var divitem = document.createElement("div");
        divitem.id='dispitem';
        var prod = products[p];
        divitem.style.float = "left";
        divitem.style.padding= "5px";
        divitem.innerHTML = "<h3>" + prod['name'] + "</h3>" +
            "<h4> Rs." + prod['price'] + "</h4>" + 
            "<h4><button onClick='addtoCartServer("+JSON.stringify(prod)+")'>Add to Cart</button></h4>";
    
        dispprod.appendChild(divitem);
    }
    container.appendChild(dispprod);
}
function searchProduct(){
    var query = document.getElementById('query').value;
    var xhr =  new XMLHttpRequest();
    var url = "/search";
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState==4 && xhr.status==200)
        {
            var products = JSON.parse(this.responseText);
            displayProducts(products); 
        }
    }
    xhr.send("query=" + query);
    return false
}

function displaySearchComp(){
    container = document.getElementById('container');
    var searchform = document.createElement("div");
    searchform.id="searchform";
    
    var formele = document.createElement("form");
    formele.setAttribute("method", "post");
    formele.setAttribute("onSubmit","return searchProduct()");

    var searchtxt = document.createElement("input");
    searchtxt.setAttribute("type", "text");
    searchtxt.setAttribute("id", "query");
    searchtxt.setAttribute("name", "query");

    formele.appendChild(searchtxt);

    var searchbtn = document.createElement("input");
    searchbtn.setAttribute("type", "submit");
    searchbtn.setAttribute("value", "Search");

    formele.appendChild(searchbtn);
    searchform.appendChild(formele);
    container.appendChild(searchform);
}

window.onload= function(){

    // Calling Search to get all products
    var xhr =  new XMLHttpRequest();
    var url = "/products";
    xhr.open("GET", url);   
    xhr.onreadystatechange = function(){
        if(xhr.readyState==4 && xhr.status==200)
        {
            var products = JSON.parse(this.responseText);
            displaySearchComp();
            displayProducts(products);
            
        }
    }
    xhr.send();
    // Check if cart is there in session; if yes create cart 
    var xhrn =  new XMLHttpRequest();
    var url = "/getCart";
    xhrn.open("GET", url);   
    xhrn.onreadystatechange = function(){
        if(xhrn.readyState==4 && xhrn.status==200)
        {
            var products = JSON.parse(this.responseText);
            for(var p in products)
            {
                addtocart(products[p]);
            }
            
        }
    }
    xhrn.send();
}