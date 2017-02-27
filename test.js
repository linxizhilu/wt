 window.onload=function(){

 var data = {
          title:"test-title",
          alt:"test-alt",
          luq:"test-luq",
          message:"test-message",
          info:"test-info",
          product:{
            name:"衣服",
            size:"40",
            color:"red"
          }
        }
        var body = document.querySelector('body'),
            tree,
            linkDWN,
            accessor,
            wt = Wt(body,data);

        tree = wt.getTree(body);
        console.log(tree);
        wt.render(tree,wt.data);

        accessor = wt.getObjToAccessor();
        console.log(accessor);
        // accessor.info = 5;
        // accessor.title = 'title';
        // accessor.alt = 'alt';
        // accessor.product.color="blue";
        // console.log(accessor.alt,accessor.product.color);
        document.querySelector('#testBtn').onclick=function(){
          accessor.info = 5;
          accessor.title = 'title';
          accessor.alt = 'alt';
        }
 }
