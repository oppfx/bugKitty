
var NebPay = require("nebpay");
var nebPay = new NebPay();
var dappAddress="n1y43ivgUkKVuvvSKEQhVFzJRDaABWHHfLh";
// var dappAddress="n1okdpG9GWCte4kWphq5ULrHzCyRxmUYuNi";//testnet
var account;
var isBuilder=false;

window.App = {
  start: function () {
    var self = this
    this.setStatus('正在加载中...')
    this.getAccount();
    
  },
  
  initKittyPage: function () {
    console.log('account:' + account)
    this.getUserKitties();
    this.getShopKitties();
  },

  getAccount:function(){
    var self=this;
    var to=dappAddress;
    nebPay.simulateCall(to, "0", "getAccount", "", {    
      listener: self.getAccountCB 
   });
  },

  setStatus:function(msg){
    $('#status').text(msg);
  },

  getAccountCB:function(cb){

      console.log('getAccountCB=='+cb.result);
      var result = JSON.parse(cb.result);
      account= result.account;
      isBuilder=result.builder;
      App.setStatus('当前账户为：'+account);
      App.initKittyPage();
      if (isBuilder) {
        $("#builder").removeClass('hide');
        $("#my-kitty").addClass('hide');
      }
  },

  
  getBalance:function(){},//TODO
  withdrawBalance:function(){},//TODO
 

  getUserKitties:function(){
    var self=this; 
    if(!isBuilder) {
     var callArgs = "[\""+account+"\"]";
      nebPay.simulateCall(dappAddress, "0", "getKitties", callArgs, {    
        listener: self.getUserKittiesCB
      });
    }
  },
  getUserKittiesCB:function(cb){
    console.log('getUserKittiesCB=='+cb.result);
      var arr = JSON.parse(cb.result);
      if(arr.length>0)
      App.initKitties(arr,'my-kitty');
  },


  getShopKitties:function(){
    var self=this;
    nebPay.simulateCall(dappAddress, "0", "getAdKitties", "", {    
      listener: self.getShopKittiesCB  
   });
  },

  getShopKittiesCB:function(cb){
    console.log('getShopKittiesCB=='+cb.result);
      var arr = JSON.parse(cb.result);
      if(arr.length>0)
      App.initKitties(arr,'kitty-shop');
      else
      $('#kitty-shop').text('猫已经被抢光了....')
  },

  //初始化宠物样式
  initKitties: function (kitties,divid) {
    console.log(kitties);
    var html = '';
    kitties.forEach(p => {
      var date=new Date(p.birth*1000);
     var birth=date.getMonth()+1+'-'+date.getDate()+' ('+date.getFullYear()+')';
      var gene=this.geneCheck(p.gene);
      var btn=divid=='kitty-shop'?'<button onclick="App.adoptKitty(' + p.id + ',0)">领养</button>':'<button onclick="App.unAdoptKitty(' + p.id +')">放养</button>'
      html += '<div class="kitty"><img src="image/'+gene+'.png" alt=""> <div>宠物ID：' + p.id + '</div><div class="k-gene">宠物基因：' + p.gene + '</div><div>宠物生日：' + birth + '</div><div>宠物价格：0 NAS</div>'+btn+'</div>';
    });
    $('#'+divid).html(html);
  },

  adoptKitty: function (id,price) {
    console.log('adopt==' + id);
    var self = this;
    this.setStatus("正在领养中...稍后自行刷新")
    var callArgs= "[\"" + id + "\"]";
    nebPay.call(dappAddress, "0", "adoptKitty", callArgs, {    
      listener: self.adoptKittyCB
   });
  },

  adoptKittyCB:function(cb){
    console.log('adoptKittyCB='+cb.result);
    // App.initKittyPage();
  },

  unAdoptKitty:function(id){
    var self=this;
    this.setStatus("正在放养中...")
    var callArgs= "[\"" + id + "\"]";
    nebPay.call(dappAddress, "0", "unAdoptKitty", callArgs, {    
      listener: self.unAdoptKittyCB
   });
  },
  unAdoptKittyCB:function(cb){
    console.log('unAdoptKittyCB='+cb.result);
    App.initKittyPage();
  },

  //基因检测
  geneCheck: function (gene) {
      var g1=gene.charAt(gene.length-1);
      var g2=gene.charAt(gene.length-2);
      return 'c'+(g1>'a'?'1':g1>5?'2':'3')+(g2>'a'?'1':g2>5?'2':'3');
  },

    
  kittyCreate: function () {
    var self = this;
    var gene=$('#kc-gene').val().trim();
    var callArgs= "[\"" + gene + "\"]";
    this.setStatus('宠物创建中...')
    $('.kitty-c').addClass('hide');
    nebPay.call(dappAddress, "0", "createKitty", callArgs, {    
      listener: self.kittyCreateCB
   });
  },
  kittyCreateCB:function(cb){
    console.log('kittyCreateCB='+cb.result);
  }

 
};

window.addEventListener('load', function () {

  $('#kitty-shop').css('width',$(document.body).width()-$('#my-account').width()-20);
  if(typeof(webExtensionWallet) === "undefined"){
    //alert ("Extension wallet is not installed, please install it first.")
    $("#noExtension").removeClass("hide");
    $("#kitty-page").addClass('hide');
  }else{
      App.start();
  }

  
});
