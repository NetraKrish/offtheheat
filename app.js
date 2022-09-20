const cartBtn=document.querySelector(".cart-btn");
const closeCartBtn=document.querySelector(".close-cart");
const clearCartBtn=document.querySelector(".clear-cart");
const cartDOM=document.querySelector(".cart");
const cartOverlay=document.querySelector(".cart-overlay");
const cartItems=document.querySelector(".cart-items");
const cartTotal=document.querySelector(".cart-total");
const cartContent=document.querySelector(".cart-content");
const productsDOM=document.querySelector(".products-center");
let cart=[];
let buttonsDOM=[];
class Products{
    async getProducts(){
        try{
            let res= await fetch("products.json");
            let data= await res.json();
            let products= Array.from(data.items);
            products=products.map(item=>{const{title,price}=item.fields;
            const{id}=item.sys;
        const image =item.fields.image.fields.file.url;
    return {title,price,id,image}})
    return products;
        }
        catch(err)
        {
            console.log(err);
        }
    }

}
class UI
{
    displayProducts(products)
    {
        let result ="";

        products.forEach(product=> {
            result+=`<article class="product"><div class="img-container"><img src=${product.image} class="product-img"><button class="bag-btn" data-id=${product.id}><i class ="fas fa-shopping-cart"></i>Add to Cart</button></div><h3>${product.title}</h3><h4>$${product.price}</h4></article>`;
          
        });
        productsDOM.innerHTML=result ;
    }
    getBagButtons(products)
    {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM=buttons;
        buttons.forEach(button=>{
            let id= button.dataset.id;
            let inCart= cart.find(item=>item.id===id);
            if(inCart)
            {
                button.innerText="In Cart";
                button.disabled=true;
            
            }
            else
            {
                button.addEventListener("click",(event)=>{
                    event.target.innerText="In Cart";
                    button.disabled=true;
                    let cartItem={...Storage.getProducts(id),amount:1};
                    cart=[...cart,cartItem];
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart();
    
                });
            }
        })
    }
    setCartValues(cart)
    {
        let tempTotal=0;
        let itemsTotal=0;
        cart.forEach(it=>{itemsTotal+=it.amount});
        
        cart.forEach(ite=>tempTotal+=ite.price*ite.amount)
        
        cartTotal.innerText=parseFloat(tempTotal.toFixed(2));
    cartItems.innerText=itemsTotal;    }
    addCartItem(item)
 {
    const div = document.createElement('div');
    div.classList.add("cart-item");
    div.innerHTML=`<img src=${item.image}></img><div><h4>${item.title}</h4><h5>$${item.price}</h5><span class="remove-item" data-id=${item.id}>remove</span></div>
<div><i class="fa-solid fa-chevron-up" data-id=${item.id}></i><p class="item-amount">${item.amount}</p> <i class="fa-solid fa-chevron-down" data-id=${item.id}></i></div>
 `;
cartContent.appendChild(div);
console.log(cartContent)}
showCart()
{
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");

}
hideCart()
{
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
}
populate(cart)
{
    cart.forEach(item=>this.addCartItem(item));
}
setUpAPP()
{
    cart=Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
   cartBtn.addEventListener("click",this.showCart);
    closeCartBtn.addEventListener("click",this.hideCart);
    }
cartLogic()
{
    clearCartBtn.addEventListener('click',()=>this.clearCart());
    cartContent.addEventListener('click',(event)=>{
        if(event.target.classList.contains("remove-item"))
        {
        let c=event.target.parentElement.parentElement;
        cartContent.removeChild(c);
        this.removeItem(event.target.dataset.id);
        };
        if(event.target.classList.contains("fa-chevron-up"))
        {
            let id=event.target.dataset.id;
            let tempItem=cart.find(item=>item.id===id);
            tempItem.amount=tempItem.amount+1;
            Storage.saveCart(cart);
            this.setCartValues(cart);
            event.target.nextElementSibling.innerText=tempItem.amount;
        }
        if(event.target.classList.contains("fa-chevron-down"))
        {
            let id=event.target.dataset.id;
            let tempItem=cart.find(item=>item.id===id);
            if(tempItem.amount>1){
            tempItem.amount=tempItem.amount-1;
            Storage.saveCart(cart);
            this.setCartValues(cart);
            event.target.previousElementSibling.innerText=tempItem.amount;
            }
            else{ let c=event.target.parentElement.parentElement;
                cartContent.removeChild(c);
                this.removeItem(event.target.dataset.id);

            }
        }
    })
}
clearCart()
{
let cartItems=cart.map(item=>item.id);
cartItems.forEach(id=>this.removeItem(id));
while(cartContent.children.length>0)
{
    cartContent.removeChild(cartContent.children[0]);
}
this.hideCart();
}
removeItem(id)
{
    cart=cart.filter(item=>item.id!==id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled=false;
    button.innerHTML=`<i class ="fas fa-shopping-cart"></i>Add to Cart`;
}
getSingleButton(id)
{
    return buttonsDOM.find(button=>button.dataset.id===id);
}
}
class Storage{
    static saveProducts(products)
    {
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProducts(id)
    {
       let products= JSON.parse(localStorage.getItem("products"));
       return products.find(product=>product.id===id);
    }
    static saveCart(cart)
    {
        localStorage.setItem("cart",JSON.stringify(cart));
    }
    static getCart()
    {
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
    }

}
document.addEventListener("DOMContentLoaded",()=>{
  
   const ui= new UI();
   ui.setUpAPP();
    const products= new Products();
    products.getProducts().then(products=>{ui.displayProducts(products);
        Storage.saveProducts(products)
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
})
