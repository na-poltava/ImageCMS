var inCart = 'Уже в корзине';
var toCart = 'В корзину';
var pcs = 'шт.';

var Shop = {
    //var Cart = new Object();
    Cart :{
        totalPrice : 0,
        totalCount : 0,
        popupCartSelector : 'script#cartPopupTemplate',
        countChanged : false,
        
        add : function(cartItem){
            //trigger before_add_to_cart
            $(document).trigger({
                type: 'before_add_to_cart',
                cartItem: _.clone(cartItem)
            });
            //
            Shop.currentItem = cartItem;
            $.post('/shop/cart/add', {
                'quantity': cartItem.count,
                'productId': cartItem.id,
                'variantId': cartItem.vId
            },
            function(data){
                try {
                        
                    responseObj = JSON.parse(data);
                    console.log(responseObj);
                        
                    //save item to storage
                    Shop.Cart._add(Shop.currentItem);
                } catch (e){
                    return this;
                }
            });

        },
        _add: function(cartItem){
            //            console.log('adding');
            //            console.log(cartItem);
            
            var currentItem = this.load(cartItem.storageId());
            if (currentItem)
                currentItem.count += cartItem.count;
            else
                currentItem = cartItem;
            
            //            console.log(cartItem);
            this.save(currentItem);
            
            
            ////trigger after_add_to_cart
            $(document).trigger({
                type: 'after_add_to_cart',
                cartItem: _.clone(cartItem)
            });
            //
            
            return this;
        },
        rm : function(cartItem){
            Shop.currentItem = cartItem;
            var sp = 'SProducts_';
            $.getJSON('/shop/cart_api/delete/'+sp+cartItem.id+'_'+cartItem.vId, function(data){
                
                localStorage.removeItem(Shop.currentItem.storageId());
                
                Shop.Cart.totalRecount();
                
                $(document).trigger({
                    type: 'cart_changed'
                });
            })
            
            
            
            return this;
        },        
        chCount : function(cartItem){
    
            var currentItem = this.load(cartItem.storageId());
            if (currentItem)
            {
                currentItem.count = cartItem.count - currentItem.count;
                
                this.countChanged = true;
                this.add(currentItem);
                
                $(document).trigger({
                    type: 'count_changed',
                    cartItem: _.clone(cartItem)
                });
                
                return this.totalRecount();
            }
            else
                return this;
        },
           
        clear: function(){
            $.getJSON('/shop/cart_api/clear', 
                function(data){
                    var items = Shop.Cart.getAllItems();
                    for (var i=0; i<items.length; i++)
                        localStorage.removeItem(items[i].storageId());
                    
                    $(document).trigger({
                        type: 'cart_changed'
                    });
                
                    Shop.Cart.totalRecount();
                }
                );
        },
    
        //work with storage
        load : function(key)
        {
            try {
                return new Shop.cartItem( JSON.parse(localStorage.getItem(key)) );            
            } catch (e){
                return false;
            }
        },
        
        save : function(cartItem)
        {
            localStorage.setItem(cartItem.storageId(), JSON.stringify(cartItem));
            this.totalRecount();
            
            ////trigger cart_changed
            $(document).trigger({
                type: 'cart_changed'
            });
            //
            
            return this;
        },
            
        getAllItems : function()
        {
            var pattern = /cartItem_*/;
            
            var items = [];
            for (var i=0; i<localStorage.length; i++)
            {
                
                var key = localStorage.key(i);
                
                console.log(key);
                
                if (key.match(pattern))
                    items.push(this.load(key));
            }
            return items;
        },
            
        length : function()
        {
            var pattern = /cartItem_*/;
            var length = 0;
            for (var i=0; i<localStorage.length; i++)
                if (localStorage.key(i).match(pattern))
                    length ++;
            
            return length;
        },
            
        totalRecount : function()
        {
            var items = this.getAllItems();
            
            this.totalPrice = 0;
            this.totalCount = 0;
            for (var i=0; i<items.length; i++)
            {
                this.totalPrice += items[i].price * items[i].count;
                this.totalCount += parseInt(items[i].count);
            }
            
            return this;
        },
        
        getTotalPrice : function() 
        {
            if (this.totalPrice == 0)
                return this.totalRecount().totalPrice;
            else
                return this.totalPrice;
        },
    
        renderPopupCart : function(selector)
        {
            if (typeof selector == 'undefined' || selector == '')
                var selector = this.popupCartSelector;
            
            _.templateSettings.variable = "cart";
            var template = _.template($(selector).html());
            return template(Shop.Cart);
        },
    
        showPopupCart : function()
        {
            console.log('start rendering')
            var start = Date.now();
            $.fancybox(this.renderPopupCart());
            var delta = Date.now() - start;
            console.log('stop rendering, elapsed time: ' + delta);
        },
            
        updatePage : function()
        {
            
        }
    },
    cartItem :function(obj) {
        if (typeof obj == 'undefined' || obj == false)
            obj = {
                id : false,
                vId : false,
                name : false, 
                count: false
            };

        return prototype = {
            id : obj.id?obj.id:0,
            vId : obj.vId?obj.vId:0,
            price : obj.price?obj.price:0,
            name : obj.name?obj.name:'',
            count : obj.count?obj.count:1,
            storageId : function(){
                return 'cartItem_'+this.id+'_'+this.vId;
            }
        };
    },
        
    composeCartItem : function($context){
        var cartItem = new Shop.cartItem();

        cartItem.id = $context.data('prodid');
        cartItem.vId = $context.data('varid');
        cartItem.price = parseFloat( $context.data('price') ).toFixed(2);
        cartItem.name = $context.data('name');

        return cartItem;
    },
        
    //settings manager
    Settings: {
        get: function(key){
            return localStorage.getItem(key);
        },
        set: function(key, value){
            localStorage.set(key, value);
            return this;
        }
    },
    
    WishList: {
        items: [],
        add: function(key){
            this.items = JSON.parse( localStorage.getItem('shopSettings'))?JSON.parse( localStorage.getItem('shopSettings')):[];
            console.log(this.items);
            //if (this.items)
            if ((key in this.items) ){
                this.items.push(key)
                localStorage.setItem('shopSettings', JSON.stringify(this.items));
            }
        }
    }
    
};


$(
    function(){
  
        //global listeners
    
        //click 'add to cart'
        $('button.btn_buy').on('click', function(){
            var cartItem = Shop.composeCartItem($(this));
            Shop.Cart.add(cartItem);
            return true;
        });

        //click 'go to cart'
        //    $('button.btn_cart').on('click', function(){
        //        var cartItem = Shop.Cart.showPopupCart();
        //        return true;
        //    });

    
    
        //cart content changed
        $(document).live('cart_changed', function(){
            
            //update page content
            //update products count
            $('div.cleaner>span>span:nth-child(3)').html(' ('+Shop.Cart.totalCount+')');
        
            var keys = [];
            _.each(Shop.Cart.getAllItems(), function(item){
                keys.push(item.id+'_'+item.vId);
            });
        
            //update all product buttons
            $('button.btn_buy').each(function(){
                var key = $(this).data('prodid')+'_'+$(this).data('varid');
                if (keys.indexOf(key) != -1)
                {
                    console.log($(this));
                    $(this).removeClass('btn_buy').addClass('btn_cart').html(inCart);
                }
            });
        
            $('button.btn_cart').each(function(){
                var key = $(this).data('prodid')+'_'+$(this).data('varid');
                if (keys.indexOf(key) == -1)
                {
                    console.log($(this));
                    $(this).removeClass('btn_cart').addClass('btn_buy').html(toCart);
                }
            });
        
            //update popup cart
            $('table.table_order td:last-child span:last-child').last().html(Shop.Cart.totalPrice.toFixed(2));
        
        });

        $(document).on('before_add_to_cart', function(event){
            console.log(event);
        });

        $(document).on('after_add_to_cart', function(event){
            initShopPage();
            Shop.Cart.countChanged = false;
        });

    }
    );

//

function initShopPage(){
    if (Shop.Cart.countChanged == false){
        
        Shop.Cart.totalRecount();

        $('#popupCart').html(Shop.Cart.renderPopupCart()).hide();

        $('[data-rel="plusminus"]').plusminus({
            prev: 'prev.children(:eq(1))',
            next: 'prev.children(:eq(0))'
        });


        // change count 
        $('div.frame_change_count>button').click(function(){
            var pd = $(this).closest('div');
            var cartItem = new Shop.cartItem({
                id: pd.data('prodid'),
                vId: pd.data('varid'),
                price: pd.data('price')
            });

            cartItem.count = pd.closest('div.frame_count').find('input').val();
            pd.closest('div.frame_count').next('span').html(cartItem.count + ' '+pcs);

            Shop.Cart.chCount(cartItem);

            //

            $('div.cleaner>span>span:nth-child(3)').html(' ('+Shop.Cart.totalCount+')');

            console.log(cartItem);

            var totalPrice = cartItem.count*cartItem.price;
            pd.closest('tr').find('span.first_cash>span').last().html(totalPrice.toFixed(2));

            $('table.table_order td:last-child span:last-child').last().html(Shop.Cart.totalPrice.toFixed(2));

        });

        $('#showCart').click();

    }
}

function rmFromPopupCart(context)
{
    var tr = $(context).closest('tr');
    var cartItem = new Shop.cartItem();
    cartItem.id = tr.data('prodid');
    cartItem.vId = tr.data('varid');
    
    Shop.Cart.rm(cartItem);
    
    console.log(cartItem);
    
    Shop.Cart.totalRecount();
    tr.remove();
}



$('[name="variant"]').live('change', function() {  
    
    
    var productId = $(this).attr('value');
    
    var vId = $('span.variant_'+productId).attr('data-id');
    var vName = $('span.variant_'+productId).attr('data-name');
    var vPrice = $('span.variant_'+productId).attr('data-price');
    var vOrigPrice = $('span.variant_'+productId).attr('data-origPrice');
    var vNumber = $('span.variant_'+productId).attr('data-number');
    var vMainImage = $('span.variant_'+productId).attr('data-mainImage');
    var vSmallImage = $('span.variant_'+productId).attr('data-smallImage');
    var vStock = $('span.variant_'+productId).attr('data-stock');
    
    
    $('#photoGroup').attr('href', vMainImage);
    $('#imageGroup').attr('src', vMainImage).removeClass().attr('alt', vName);
    $('#priceOrigVariant').html(vOrigPrice);
    $('#priceVariant').html(vPrice);
    if($.trim(vNumber) != ''){
        $('#number').html('(Артикул ' + vNumber + ')');
    }else{
        $('#number').html(' ');
    }
    
    var productId = $(this).attr('value');
    $('.variant').hide();
    $('.variant_'+productId).show();    
});