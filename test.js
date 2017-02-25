var flag = '-',
    //匹配换行符和制表符
    patCgLine = /[\n\f\r\v]+/;
    function getCurDomObj(node,id){
      var lastId = id || 0;
      var tempTree    = {
            id : lastId
            , tag : ""
            , props : []
            , children  : []
            , text  : []
          },
          attrMap,
          childNodes,
          tempId = 0;
      tempTree.tag = node.tagName;
      attrMap = node.attributes;
      for(var i = 0,len = attrMap.length; i < len; i++){
        var tempObj = {};
        tempObj[attrMap[i].nodeName] = attrMap[i].nodeValue;
        tempTree.props.push(tempObj);
      }
      childNodes = node.childNodes;
      for(i =0 ,len = childNodes.length;i<len;i++){
        var curNode = childNodes[i],
            nodeValue = curNode.nodeValue;
        if(curNode.nodeType ===3){
          if(!patCgLine.test(nodeValue)){
            tempTree.text.push({index:i,value:curNode.nodeValue});
          }
          continue;
        }else if(curNode.nodeType === 1){
          id = lastId + (flag + (tempId++));
          tempTree.children.push( getCurDomObj(curNode,id) );
        }
      }
      return tempTree;
    }

    function getNode(root,ary){
      var node ,
          children ,
          target;
          children = root.children;
      node = children[parseInt(ary.shift())]
      if(!!node){
        return  getNode(node,ary);
      }else{
        return root;
      }

    }
