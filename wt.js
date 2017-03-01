var flag = true;

function Wt(root, data) {
    if (!(this instanceof arguments.callee)) return new Wt(root, data);
    this.root = root;
    this.data = data;
    this.linkDWN = {};
    this.init();
}
Object.assign(Wt.prototype, {
    _flag: '-',
    _patCgLine: /^[\n\f\r\v\s]+$/,
    _patTextHasFlag: /(\{\{)([^\}]+)(\}\})/gi,
    _patTextNoFlag: /([^\{\}]+)(?=\}\})/ig,
    _patPropDirective: /luq:([\d\w\-]+)/i,
    init: function() {
        var self = this;
        self.linkDWN = transformObjToLinkObj(self.data);
        var domTree = getDomTree(document.body,0,self.linkDWN,self.data);
        self.tree = domTree.tree;
        self.linkDWN = domTree.linkObj;
        console.log(domTree);
    },
    getTree: function() {
        return this.tree;
    },
    getLinkDataToNode: function() {
        return this.linkDWN;
    },
    // _createInitalDomTree: function(node, id) {
    //     var self = this,
    //         lastId = id || 0,
    //         tempTree = {
    //             id: lastId,
    //             tag: "",
    //             props: [],
    //             childNodes: [],
    //             children: []
    //         },
    //         attrMap,
    //         childNodes,
    //         tempId = 0,
    //         i,
    //         len,
    //         tempObj,
    //         linkObj,
    //         curNode,
    //         nodeName,
    //         nodeValue,
    //         linkKey,
    //         linkItem;
    //     tempTree.tag = node.tagName;
    //     for (i = 0, len = (attrMap = node.attributes).length; i < len; i++) {
    //         tempObj = {};
    //         nodeName = attrMap[i].nodeName;
    //         nodeValue = attrMap[i].nodeValue;
    //         tempObj[nodeName] = nodeValue;
    //         tempTree.props.push(tempObj);
    //         if(self._patPropDirective.test(nodeName)){
    //           linkObj = {};
    //           linkObj.type = 'prop';
    //           linkObj.key = nodeName.match(self._patPropDirective)[1];
    //           linkObj.value = nodeValue;
    //           linkObj.id = lastId;
    //           linkKey = nodeValue.replace(self._patTextHasFlag,function(item){
    //             return item.match(self._patTextNoFlag);
    //           })
    //           if(linkKey.indexOf('.')!==-1){
    //             // linkKey = linkKey.split('.').join('-');
    //             getObjValueByAry(linkKey.split('.'),self.linkDWN).push(linkObj);
    //           }else{
    //             self.linkDWN[linkKey].push(linkObj);
    //           }
    //           // if(!self.linkDWN[linkKey]){
    //           //   self.linkDWN[linkKey] = [];
    //           // }
    //         }
    //     }
    //     childNodes = node.childNodes;
    //     for (i = 0, len = childNodes.length; i < len; i++) {
    //         curNode = childNodes[i],
    //         nodeValue = curNode.nodeValue,
    //         // 用来关联数据,关联数据的话，只跟text节点有关系
    //         linkObj = {},
    //         // 用来重新渲染dom树
    //         tempObj = {};
    //
    //         if (curNode.nodeType === 3) {
    //             tempObj['type'] = 'text';
    //             tempObj['index'] = i;
    //             tempObj['value'] = nodeValue  =curNode.nodeValue;
    //             if(self._patTextHasFlag.test(nodeValue)){
    //                 linkObj.type = 'text';
    //               var hasFlagAry = nodeValue.match(self._patTextHasFlag);
    //               for(var key of hasFlagAry){
    //                 var noFlagMatches = key.match(self._patTextNoFlag);
    //                 linkObj.index = i;
    //                 linkObj.key = noFlagMatches[0];
    //                 linkObj.value = nodeValue;
    //                 linkObj.id = lastId;
    //                 linkKey = linkObj.key;
    //                 if(linkKey.indexOf('.')!==-1){
    //                   linkObj.key = linkKey.split('.').pop();
    //                   getObjValueByAry(linkKey.split('.'),self.linkDWN).push(linkObj);
    //                 }else{
    //                   self.linkDWN[linkKey].push(linkObj);
    //                 }
    //               }
    //             }
    //             tempTree.childNodes.push(tempObj);
    //         } else if (curNode.nodeType === 1) {
    //             id = lastId + (self._flag + (tempId++));
    //             tempObj['type'] = 'node';
    //             tempObj['index'] = i;
    //             tempObj['value'] = arguments.callee.call(self, curNode, id);
    //             tempTree.childNodes.push(tempObj);
    //         }
    //     }
    //     return tempTree;
    // },
    // // 通过id获取节点
    // getNode: function(str) {
    //     var self = this,
    //         node,
    //         children,
    //         target,
    //         ary,
    //         len;
    //     children = document.body.children;
    //     if(str.indexOf(self._flag)!==-1){
    //       ary = str.split(self._flag),
    //       ary.shift();
    //       len= ary.length;
    //       while (len>0) {
    //         node = children[ary.shift()];
    //         children = node.children;
    //         len--;
    //       }
    //     }else{
    //       node  = self.root;
    //     }
    //     return node;
    // },
    // // 获取当前数据的存取器对象
    getObjToAccessor: function() {
        var self = this;
        return transformObjToAccessor.call(self,self.data,self.linkDWN);
    },
    // 将data转换为存取器对象
    // _createObjToAccessor: function(data) {
    //     var self = this,
    //         data = data || {},
    //         tempData = {},
    //         key,
    //         options = {};
    //     for (key in data) {
    //         if (typeof data[key] !== 'object') {
    //             tempData = defProPerty.call(self,tempData, key, data ,self.linkDWN[key]);
    //         } else {
    //             tempData[key] = self._createObjToAccessor(data[key]);
    //         }
    //     }
    //     return tempData;
    // },
    //
    // // 根据iniatlDomTree重新生成dom树
    // render: function(initDomTree, data) {
    //     if (!flag) return;
    //     var self = this,
    //         elemTree = ((function createElem(initDomTree, data) {
    //             var tag = initDomTree.tag.toLowerCase(),
    //                 textElem = document.createElement(tag),
    //                 props = initDomTree.props,
    //                 texts = initDomTree.text,
    //                 childNodes = initDomTree.childNodes,
    //                 childNode,
    //                 key,
    //                 i = 0,
    //                 len,
    //                 prop,
    //                 textNode,
    //                 attrKey,
    //                 attrValue;
    //             for (len = props.length; i < len; i++) {
    //                 prop = props[i];
    //                 for (key in prop) {
    //                     if (self._patPropDirective.test(key)) {
    //                         attrKey = key.match(self._patPropDirective)[1];
    //                         attrValue = prop[key];
    //                         attrValue = attrValue.replace(self._patTextHasFlag, function(item) {
    //                             return resolveValue.call(self,item);
    //                         })
    //                     }else{
    //                       attrKey = key;
    //                       attrValue = prop[key];
    //                     }
    //                     textElem.setAttribute(attrKey, attrValue);
    //                 }
    //             }
    //             for (i = 0, len = childNodes.length; i < len; i++) {
    //                 childNode = childNodes[i];
    //                 if (childNode.type === 'text') {
    //                     var nodeValue = childNode.value;
    //                     if (self._patTextHasFlag.test(nodeValue)) {
    //                         var newValue = nodeValue.replace(self._patTextHasFlag, function(item) {
    //                               return resolveValue.call(self,item);
    //                         });
    //                         nodeValue = newValue;
    //                     }
    //                     textNode = document.createTextNode(nodeValue);
    //                     textElem.appendChild(textNode);
    //                 } else if (childNode.type === 'node') {
    //                     textElem.appendChild(createElem(childNode.value))
    //                 }
    //             }
    //             return textElem;
    //
    //         })(initDomTree, data))
    //     var id = initDomTree.id;
    //     var node  = self.getNode(id+'');
    //     node.parentNode.replaceChild(elemTree,node);
    //     flag = false;
    // }
})
var patObj = {
  flag : '-',
  patCgLine: /^[\n\f\r\v\s]+$/,
  patTextHasFlag: /(\{\{)([^\}]+)(\}\})/gi,
  patTextNoFlag: /([^\{\}]+)(?=\}\})/ig,
  patPropDirective: /luq:([\d\w\-]+)/i,
}
// toString
function toString(any){
  return ({}).toString.call(any);
};
// 解析单个节点引擎,只对props及text进行解析
function compileNode(obj){
  var self = this,
      node = obj.node,
      data = obj.data,
      type = obj.type,
      key  = obj.key||'',
      value = obj.value,
      nodeIndex = obj.nodeIndex||0,
      newValue;
      if(type === 'prop'){
        value = value.replace(patObj.patTextHasFlag, function(item) {
            return resolveValue.call(self,item,data);
        })
        node.setAttribute(key, value);
      }else if(type === 'text'){
        newValue = value.replace(patObj.patTextHasFlag, function(item) {
              return resolveValue.call(null,item,data);
        });
        textNode = document.createTextNode(newValue);
        node.replaceChild(textNode,node.childNodes[nodeIndex]);
      }
}
// 通过原始dom树，生成一个dom树和link对象
function getDomTree(node,id,linkTreeAndDataObj,data){
  var tree = (function (node,id,linkTreeAndDataObj){
    var self = this,
    lastId = id || 0,
    tempTree = {
      id: lastId,
      tag: "",
      props: [],
      childNodes: []
    },
    attrMap,childNodes,tempId = 0,
    i,
    len,
    tempObj,
    linkObj,
    curNode,
    nodeName,
    nodeValue,
    linkKey,
    linkItem,
    hasFlagAry;
    tempTree.tag = node.tagName;
    for (i = 0, len = (attrMap = node.attributes).length; i < len; i++) {
      tempObj = {};
      nodeName = attrMap[i].nodeName;
      nodeValue = attrMap[i].nodeValue;
      tempObj[nodeName] = nodeValue;
      tempTree.props.push(tempObj);
      if(patObj.patPropDirective.test(nodeName)){
        linkObj = {};
        linkObj.type = 'prop';
        linkObj.key = nodeName.match(patObj.patPropDirective)[1];
        linkObj.value = nodeValue;
        linkObj.id = lastId;
        linkKey = nodeValue.replace(patObj.patTextHasFlag,function(item){
          return item.match(patObj.patTextNoFlag);
        })
        if(linkKey.indexOf('.')!==-1){
          getObjValueByAry(linkKey.split('.'),linkTreeAndDataObj).push(linkObj);
        }else{
          linkTreeAndDataObj[linkKey].push(linkObj);
        }
        compileNode({
          node : node,
          data : data,
          type : 'prop',
          key  : linkObj.key,
          value : nodeValue,
          nodeIndex : 0
        })
      }
    }
    childNodes = node.childNodes;
    for (i = 0, len = childNodes.length; i < len; i++) {
      curNode = childNodes[i],
      nodeValue = curNode.nodeValue,
      // 用来关联数据,关联数据的话，只跟text节点有关系
      linkObj = {},
      // 用来重新渲染dom树
      tempObj = {};
      if (curNode.nodeType === 3) {
        tempObj['type'] = 'text';
        tempObj['index'] = i;
        tempObj['value'] = nodeValue = curNode.nodeValue;
        if(patObj.patTextHasFlag.test(nodeValue)){
          linkObj.type = 'text';
          hasFlagAry = nodeValue.match(patObj.patTextHasFlag);
          for(var key of hasFlagAry){
            var noFlagMatches = key.match(patObj.patTextNoFlag);
            linkObj.index = i;
            linkObj.key = noFlagMatches[0];
            linkObj.value = nodeValue;
            linkObj.id = lastId;
            linkKey = linkObj.key;
            if(linkKey.indexOf('.')!==-1){
              linkObj.key = linkKey.split('.').pop();
              getObjValueByAry(linkKey.split('.'),linkTreeAndDataObj).push(linkObj);
            }else{
              linkTreeAndDataObj[linkKey].push(linkObj);
            }
          }
          compileNode({
            node : node,
            data : data,
            type : 'text',
            key  : linkObj.key,
            value : linkObj.value,
            nodeIndex : linkObj.index
          })
        }
        tempTree.childNodes.push(tempObj);
      } else if (curNode.nodeType === 1) {
        id = lastId + patObj.flag + i;
        tempObj['type'] = 'node';
        tempObj['index'] = i;
        tempObj['value'] = arguments.callee.call(self, curNode, id ,linkTreeAndDataObj);
        tempTree.childNodes.push(tempObj);
      }
    }
    return tempTree;
  }(node,id,linkTreeAndDataObj));
  return {
    tree:tree,
    linkObj : linkTreeAndDataObj
  }
}
// 查找dom节点，兼容传入dom的情况
function queryDom(selector,elem){
  if(arguments.length === 0){
    return document;
  }
  var type,
      _elem = ((type = typeof elem) === 'undefined' ||(elem.nodeType && elem.nodeType) === 9 )? document : type === 'string' ? document.querySelector(elem) : type === 'object' && elem.nodeType && elem.nodeType === 1 ? elem : document,
      _dom = (type = typeof selector) === 'string' ? _elem.querySelector(selector) : type === 'object' && selector.nodeType && selector.nodeType === 1 ? selector : _elem;
      return _dom;
}
// 解析正则匹配到的字符串
function resolveValue(item,data,newkey,newvalue) {
  var self = this,
  key = item.match(patObj.patTextNoFlag)[0],
  value;
  if(!!newkey &&key == newkey){
    return newvalue;
  }
  if (key.indexOf('.') !== -1) {
    var tempAry = key.split('.'),
    i = 0,
    val, tempLinkObj;
    while ((val = tempAry[i++]) !== undefined) {
      if (!value) {
        value = data[val];
      } else {
        value = value[val];
      }
    }
  } else {
    value = data[key];
  }
  return value;
}
// 将一个对象转为accessor对象
function transformObjToAccessor(obj,linkViewWithDataObj){
  var self = this,
      obj = obj || {},
      tempObj = {},
      key,
      options = {};

  for (key in obj) {
    console.log(linkViewWithDataObj,key);
      if (typeof obj[key] !== 'object') {
          tempObj = defProPerty.call(self,tempObj, key, obj ,linkViewWithDataObj[key]);
      } else {
          tempObj[key] = transformObjToAccessor.call(self,obj[key],linkViewWithDataObj[key]);
      }
  }
  return tempObj;
}
// 为一个accessor对象添加属性
function defProPerty(obj, key, defObj, linkAry) {
  console.log(linkAry);
  var self = this;
    return Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        set: function(newValue) {
            var item,id,node,index;
            if(!!linkAry){
              for(item of linkAry){
                id = item.id;
                node = getNodeById({id:id});
                if(item.type =='prop'){
                  node.setAttribute(item.key,newValue);
                }else if(item.type == 'text'){
                  index = item.index;
                  key = item.key;
                  nodeValue = item.value;
                  childNode = node.childNodes[index];
                  childNode.nodeValue = nodeValue.replace(patObj.patTextHasFlag,function(item){
                    return  resolveValue.call(self,item,defObj,key,newValue)
                  })
                }
              }
            }
            defObj[key] = newValue;
        },
        get: function() {
            return defObj[key];
        }
    })
}
// 生成一个null对象
function createObject(obj){
  return !!obj ? Object.create(obj) : Object.create(null);
}
// 将一个Object转换成link树
function transformObjToLinkObj(obj){
  return (function actionFn(o){
      var tempObj = createObject(),
      key,
      type;
    for( key in o){
      if( toString(o[key]) === "[object Object]" ){
        tempObj[key] = actionFn.call(null,o[key])
      }else{
        tempObj[key] = [];
      }
    }
    return tempObj;
  }(obj))
}
// 根据一个数据返回一个末端为数组的对象
function getObjValueByAry(ary,obj){
  var len=ary.length,
      tempObj;
  while(len-- >0){
    if(!tempObj){
      tempObj = obj[ary.shift()];
    }else{
      tempObj = tempObj[ary.shift()]
    }
  }
  return tempObj;
}
/*通过id字符串查找node节点
* id str||num 查找dom用的索引
* root dom||selector 开始索引的根节点
* flag str 分割id用的符号  default '.'
*/
function getNodeById(obj){
  var id = obj.id ,
      root = obj.root ,
      flag = obj.flag || patObj.flag,
      type,rootDom,index,indexAry,hasSignFlag,indexAryLength,node;
      type = typeof id;
  if(type === 'undefined'){
    console.error('输入一个id索引字符串');
    return;
  }
  id = id+'';
  type = typeof root;
  if(type === 'undefined'){
    root = document.body;
  }
  rootDom = queryDom(root);
  hasSignFlag = id.indexOf(flag);
  indexAry = hasSignFlag !==-1 ? id.split(flag) : [id];
  node = +(index = indexAry.shift()) === 0 ? rootDom : rootDom.parentNode.childNodes[index];
  indexAryLength = indexAry.length;
  while(indexAryLength-- >0){
    node = node.childNodes[indexAry.shift()];
  }
  return node;
}
