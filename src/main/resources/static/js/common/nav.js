

var loginFlag = false;
var cartHtml="<nav class=\"navbar navbar-inverse\">\n" +
    "    <div class=\"container-fluid\">\n" +
    "        <!-- Brand and toggle get grouped for better mobile display -->\n" +
    "        <div class=\"navbar-header\">\n" +
    "            <a class=\"navbar-brand\" href=\"#\">飞狐电商后台</a>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Collect the nav links, forms, and other content for toggling -->\n" +
    "        <div class=\"collapse navbar-collapse\" id=\"bs-example-navbar-collapse-1\">\n" +
    "\n" +
    "            <ul class=\"nav navbar-nav navbar-right\">\n" +
    "                <li id=\"loginInfo\"><a href=\"/login.html\">登陆</a></li>\n" +
    "                <li><a href=\"/menberRegiste.html\">注册</a></li>\n" +
    "                <li><a href=\"/cart.html\">购物车</a></li>\n" +
    "            </ul>\n" +
    "        </div><!-- /.navbar-collapse -->\n" +
    "    </div><!-- /.container-fluid -->\n" +
    "</nav>";

    $("#navDiv").html(cartHtml);

    var v_loginFrom;
    $(function () {
        v_loginFrom = $("#memberLoginDiv").html();
        $.ajaxSetup({
            beforeSend:function(xhr){
                var cookie = $.cookie("fh_auth");
                xhr.setRequestHeader("x_auth",cookie);
            },
        })
        $.ajax({
            url:"http://localhost:8086/members/memberInfo",
            type:"get",
            async:false,
            success:function (result) {
                if (result.code == 200){
                    loginFlag = true;
                    $("#loginInfo").html('<a>欢迎'+result.data+'登陆</a><a href="#" onclick="loginOut()">退出登陆</a>');
                }
            }
        })
    })

function loginOut() {
    $.ajax({
        url:"http://localhost:8086/members/loginOut",
        type:"get",
        success:function (result) {
            if (result.code == 200){
                /*清空cookie*/
                $.removeCookie("fh_auth");
                //刷新页面
                location.href="/list.html";
            }
        }
    })
}

var v_login;
function buyProduct(productId,flag,action) {
    var count ;
    if (action == "minus"){
        count = -1;
    }else{
        count = 1;
    }
    if (loginFlag){
        $.ajax({
            url:"http://localhost:8086/carts",
            type:"post",
            data:{
                "productId":productId,
                "count":count,
            },
            success:function (result) {
                if (result.code == 200){
                    if (flag == 1){
                        initCart();
                    }else{
                        location.href = "cart.html";
                    }

                }
            }
        })
    }else{
        v_login =  bootbox.dialog({
            title:"登陆页面",
            message: $("#memberLoginDiv form"),
            //size:"large",
            backdrop:false,
            buttons: {
                confirm: {
                    label: "<span class='glyphicon glyphicon-ok'></span>保存",
                    className: 'btn-danger',
                    callback: function(){
                        //点击确定按钮 发送ajax请求，插入数据
                        var v_userName = $("#userName",v_login).val();
                        var v_password = $("#password",v_login).val();

                        $.ajax({
                            url:"http://localhost:8086/members/login",
                            type:"post",
                            data:{
                                "userName":v_userName,
                                "password":v_password
                            },
                            success:function (result) {
                                if (result.code==200){
                                    loginFlag=true;
                                    var v_data = result.data;
                                    $.cookie("fh_auth",v_data);
                                    buyProduct(productId);
                                }
                            }
                        })
                    }
                },
                cancel: {
                    label: "<span class='glyphicon glyphicon-remove'></span>关闭",
                    className: 'btn-warning',

                },
            },
        })
         $("#memberLoginDiv").html(v_loginFrom);
    }

}

function initCart() {
    if (!loginFlag) {
        $("#cartDiv").html("<div style='text-align: center'><h1>恁好！请先<a href='/login.html'>登陆</a>或者<a href='menberRegiste.html'>注册</a></h1></div>");
    }else {
        $.ajax({
            type: "get",
            url: "http://localhost:8086/carts",
            success: function (result) {
                console.log(result);
                if (result.code == 5202) {
                    $("#cartDiv").html("<div style='text-align: center'><h1>您的购物车没有商品<a href='list.html'>添加商品</a></h1></div>");
                }else if (result.code == 200){
                    var v_cart = result.data;
                    var v_cartArr = v_cart.itemCart;
                    console.log(v_cartArr);
                    $("#cartBody").html("");
                    for (var i = 0; i < v_cartArr.length; i++) {
                        var v_cartItem = v_cartArr[i];
                        var v_cartInfo =  $("#cartItemModel").html().replace(/##image##/g,v_cartItem.image)
                            .replace(/##productName##/g,v_cartItem.productName)
                            .replace(/##price##/g,v_cartItem.price)
                            .replace(/##count##/g,v_cartItem.count)
                            .replace(/##subTotalPrice##/g,v_cartItem.subTotalPrice)
                            .replace(/##productId##/g,v_cartItem.productId)
                        $("#cartBody").append(v_cartInfo)
                    }
                    $("#totalDiv").html("");
                    var v_cartTotal =  $("#cartTotalDiv").html().replace(/##totalCount##/g,v_cart.totalCount)
                        .replace(/##totalPrice##/g,v_cart.totalPrice)
                    $("#totalDiv").append(v_cartTotal)
                }
            }
        })
    }

}