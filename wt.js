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
        var domTree = getDomTree(document.body, 0, self.linkDWN, self.data);
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
    getObjToAccessor: function() {
        var self = this;
        return transformObjToAccessor.call(self, self.data, self.linkDWN);
    }
})
var patObj = {
    flag: '-',
    patCgLine: /^[\n\f\r\v\s]+$/,
    patTextHasFlag: /(\{\{)([^\}]+)(\}\})/gi,
    patTextNoFlag: /([^\{\}]+)(?=\}\})/ig,
    patPropDirective: /luq:([\d\w\-]+)/i,
    patDirectiveEach:/^\{\{\s*(\s*for\s*\((.*)\s+of\s+(.*)\))\s*\}\}$/i,
    patDirectiveEachArgs:/([^\[\]])+/ig
}
// toString
function toString(any) {
    return ({}).toString.call(any);
};
// 解析单个节点引擎,只对props及text进行解析
function compileNode(obj) {
    var self = this,
        node = obj.node,
        data = obj.data,
        type = obj.type,
        key = obj.key || '',
        value = obj.value,
        nodeIndex = obj.nodeIndex || 0,
        newValue;
    if (type === 'prop') {
        if(key==='each'){

        }else{
          value = value.replace(patObj.patTextHasFlag, function(item) {
            return resolveValue.call(self, item, data);
          })
          node.setAttribute(key, value);
        }
    } else if (type === 'text') {
        newValue = value.replace(patObj.patTextHasFlag, function(item) {
            return resolveValue.call(null, item, data);
        });
        textNode = document.createTextNode(newValue);
        node.replaceChild(textNode, node.childNodes[nodeIndex]);
    }
}
// 通过原始dom树，生成一个dom树和link对象
function getDomTree(node, id, linkTreeAndDataObj, data) {
    var tree = (function(node, id, linkTreeAndDataObj) {
        var self = this,
            lastId = id || 0,
            tempTree = {
                id: lastId,
                tag: "",
                props: [],
                childNodes: []
            },
            attrMap, childNodes, tempId = 0,
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
            if (patObj.patPropDirective.test(nodeName)) {
                linkObj = {};
                linkObj.type = 'prop';
                linkObj.key = nodeName.match(patObj.patPropDirective)[1];
                linkObj.value = nodeValue;
                linkObj.id = lastId;
                if(linkObj.key === 'each'){
                  console.log('Directive');
                   Directive(node,linkObj.key,nodeValue,data)
                }else{
                  linkKey = nodeValue.replace(patObj.patTextHasFlag, function(item) {
                    return item.match(patObj.patTextNoFlag);
                  })
                  if (linkKey.indexOf('.') !== -1) {
                    getObjValueByAry(linkKey.split('.'), linkTreeAndDataObj).push(linkObj);
                  } else {
                    linkTreeAndDataObj[linkKey].push(linkObj);
                  }
                  compileNode({
                    node: node,
                    data: data,
                    type: 'prop',
                    key: linkObj.key,
                    value: nodeValue,
                    nodeIndex: 0
                  })
                }
            }
        }
        childNodes = node.childNodes;
        for (i = 0; i < childNodes.length; i++) {
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
                if (patObj.patTextHasFlag.test(nodeValue)) {
                    linkObj.type = 'text';
                    hasFlagAry = nodeValue.match(patObj.patTextHasFlag);
                    for (var key of hasFlagAry) {
                        var noFlagMatches = key.match(patObj.patTextNoFlag);
                        linkObj.index = i;
                        linkObj.key = noFlagMatches[0];
                        linkObj.value = nodeValue;
                        linkObj.id = lastId;
                        linkKey = linkObj.key;
                        if (linkKey.indexOf('.') !== -1) {
                            linkObj.key = linkKey.split('.').pop();
                            getObjValueByAry(linkKey.split('.'), linkTreeAndDataObj).push(linkObj);
                        } else {
                            linkTreeAndDataObj[linkKey].push(linkObj);
                        }
                    }
                    compileNode({
                        node: node,
                        data: data,
                        type: 'text',
                        key: linkObj.key,
                        value: linkObj.value,
                        nodeIndex: linkObj.index
                    })
                }
                tempTree.childNodes.push(tempObj);
            } else if (curNode.nodeType === 1) {
                id = lastId + patObj.flag + i;
                tempObj['type'] = 'node';
                tempObj['index'] = i;
                tempObj['value'] = arguments.callee.call(self, curNode, id, linkTreeAndDataObj);
                tempTree.childNodes.push(tempObj);
            }
        }
        return tempTree;
    }(node, id, linkTreeAndDataObj));
    return {
        tree: tree,
        linkObj: linkTreeAndDataObj
    }
}
// 查找dom节点，兼容传入dom的情况
function queryDom(selector, elem) {
    if (arguments.length === 0) {
        return document;
    }
    var type,
        _elem = ((type = typeof elem) === 'undefined' || (elem.nodeType && elem.nodeType) === 9) ? document : type === 'string' ? document.querySelector(elem) : type === 'object' && elem.nodeType && elem.nodeType === 1 ? elem : document,
        _dom = (type = typeof selector) === 'string' ? _elem.querySelector(selector) : type === 'object' && selector.nodeType && selector.nodeType === 1 ? selector : _elem;
    return _dom;
}
// 解析正则匹配到的字符串
function resolveValue(item, data, newkey, newvalue) {
    var self = this,
        key = item.match(patObj.patTextNoFlag)[0],
        value;
    if (!!newkey && key == newkey) {
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
function transformObjToAccessor(obj, linkViewWithDataObj) {
    var self = this,
        obj = obj || {},
        tempObj = {},
        key,
        options = {};
    for (key in obj) {
        if (typeof obj[key] !== 'object') {
            tempObj = defProPerty.call(self, tempObj, key, obj, linkViewWithDataObj[key]);
        } else {
            tempObj[key] = transformObjToAccessor.call(self, obj[key], linkViewWithDataObj[key]);
        }
    }
    return tempObj;
}
// 为一个accessor对象添加属性
function defProPerty(obj, key, defObj, linkAry) {
    var self = this;
    return Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        set: function(newValue) {
            var item, id, node, index;
            if (!!linkAry) {
                for (item of linkAry) {
                    id = item.id;
                    node = getNodeById({
                        id: id
                    });
                    if (item.type == 'prop') {
                        node.setAttribute(item.key, newValue);
                    } else if (item.type == 'text') {
                        index = item.index;
                        key = item.key;
                        nodeValue = item.value;
                        childNode = node.childNodes[index];
                        childNode.nodeValue = nodeValue.replace(patObj.patTextHasFlag, function(item) {
                            return resolveValue.call(self, item, defObj, key, newValue)
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
function createObject(obj) {
    return !!obj ? Object.create(obj) : Object.create(null);
}
// 将一个Object转换成link树
function transformObjToLinkObj(obj) {
    return (function actionFn(o) {
        var tempObj = createObject(),
            key,
            type;
        for (key in o) {
            if (toString(o[key]) === "[object Object]") {
                tempObj[key] = actionFn.call(null, o[key])
            } else {
                tempObj[key] = [];
            }
        }
        return tempObj;
    }(obj))
}
// 根据一个数据返回一个末端为数组的对象
function getObjValueByAry(ary, obj) {
    var len = ary.length,
        tempObj;
    while (len-- > 0) {
        if (!tempObj) {
            tempObj = obj[ary.shift()];
        } else {
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
function getNodeById(obj) {
    var id = obj.id,
        root = obj.root,
        flag = obj.flag || patObj.flag,
        type, rootDom, index, indexAry, hasSignFlag, indexAryLength, node;
    type = typeof id;
    if (type === 'undefined') {
        console.error('输入一个id索引字符串');
        return;
    }
    id = id + '';
    type = typeof root;
    if (type === 'undefined') {
        root = document.body;
    }
    rootDom = queryDom(root);
    hasSignFlag = id.indexOf(flag);
    indexAry = hasSignFlag !== -1 ? id.split(flag) : [id];
    node = +(index = indexAry.shift()) === 0 ? rootDom : rootDom.parentNode.childNodes[index];
    indexAryLength = indexAry.length;
    while (indexAryLength-- > 0) {
        node = node.childNodes[indexAry.shift()];
    }
    return node;
}
// 处理each循环node的情况
var deleteNodesAry = [];
function Directive(node,key,value,data){
  if(!(this instanceof arguments.callee))return new Directive(node,key,value,data);
  this.node = node;
  this.key = key;
  this.value = value;
  this.data = data;
  this.init(this.key);
}
Object.assign(Directive.prototype,{
  init:function(key){
    var self = this;
        node = self.node,
        key = self.key,
        value = self.value,
        data = self.data;

    this[key].call(self,node,key,value,data)
  },
  each:function(node,key,value,data){
    console.log(node,key,value,data);
    var parentNode = node.parentNode,
        evalSentence,
        args,
        dataSentence,
        dataAry,
        matches,
        method,
        argsNum = 1,
        argsAry,
        selfNode = true,
        nodeAry =[],
        tempNode;
        console.log('sdf');
    if(patObj.patDirectiveEach.test(value)){
      matches = value.match(patObj.patDirectiveEach);
      evalSentence = matches[1].trim();
      args= matches[2].trim();
      dataSentence = matches[3].trim();
      // 对入参进行解析
      if(patObj.patDirectiveEachArgs.test(args)){
        args = args.match(patObj.patDirectiveEachArgs)[0]
      }
      if(args.indexOf(',')!==-1){
        argsNum = 2;
      }
      // 对被遍历对象进行解析
      if(dataSentence.indexOf(')')!==-1){
        dataAry = dataSentence.substring(0,dataSentence.lastIndexOf('(')).split('.');
        method = dataAry.pop();
      }else{
        dataAry = dataSentence.split('.');
      }
      // 通过一个数组获取对象的value
      dataAry = getObjValueByAry(dataAry, data);
      if(!!method){
        dataAry = dataAry[method]();
      }
      if(toString(dataAry)==='[object Object]'){
          dataAry = Object.entries(dataAry);
      }
      for(let [index,item] of dataAry){
        eachFn(index,item);
      }
      while((tempNode = nodeAry.pop())!= null){
        node.insertAdjacentElement('afterEnd',tempNode);
      }
    }
    function eachFn(){
      var _arguments = arguments,
          eachObj = {},
          eachAry = [],
          sibilingNode;
          // 删除each属性
          if(argsNum >1){
            for(let [index,item] of args.split(',').entries()){
              eachObj[item] = _arguments[index];
            }
          }else{
            eachObj['@index'] = _arguments[0]
            eachObj[args] = _arguments[1]
          }
          eachAry.push(eachObj);

          sibilingNode = node.cloneNode(node);
          sibilingNode.removeAttribute('luq:each');
          // node.insertAdjacentElement('afterEnd',sibilingNode);


          sibilingNode['eachdata'] = eachAry;
          sibilingNode.setAttribute('eachdata',JSON.stringify(eachObj));
          nodeAry.push(sibilingNode);

    }
  }
})
