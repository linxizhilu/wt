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
        wt.render(document.querySelector('html'),tree);
        linkDWN = wt.getLinkDataToNode();
        console.log(tree);
        accessor = wt.getObjToAccessor();
        console.log(accessor);
        accessor.info = 5;
        // accessor.product.color="blue";
        // console.log(accessor.alt,accessor.product.color);
 }
