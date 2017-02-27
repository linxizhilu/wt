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
    },
    getTree: function() {
        return this._createInitalDomTree(this.root);
    },
    getLinkDataToNode: function() {
        return this.linkDWN;
    },
    _createInitalDomTree: function(node, id) {
        var self = this,
            lastId = id || 0,
            tempTree = {
                id: lastId,
                tag: "",
                props: [],
                childNodes: [],
                children: []
            },
            attrMap,
            childNodes,
            tempId = 0,
            i,
            len,
            tempObj,
            linkObj,
            curNode,
            nodeName,
            nodeValue,
            linkKey,
            linkItem;
        tempTree.tag = node.tagName;
        for (i = 0, len = (attrMap = node.attributes).length; i < len; i++) {
            tempObj = {};
            nodeName = attrMap[i].nodeName;
            nodeValue = attrMap[i].nodeValue;
            tempObj[nodeName] = nodeValue;
            tempTree.props.push(tempObj);
            if(self._patPropDirective.test(nodeName)){
              linkObj = {};
              linkObj.type = 'prop';
              linkObj.key = nodeName.match(self._patPropDirective)[1];
              linkObj.value = nodeValue;
              linkObj.id = lastId;
              linkKey = nodeValue.replace(self._patTextHasFlag,function(item){
                return item.match(self._patTextNoFlag);
              })
              if(linkKey.indexOf('.')!==-1){
                linkKey = linkKey.split('.').join('-');
              }
              if(!self.linkDWN[linkKey]){
                self.linkDWN[linkKey] = [];
              }
              self.linkDWN[linkKey].push(linkObj);
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
                tempObj['value'] = nodeValue  =curNode.nodeValue;

                if(self._patTextHasFlag.test(nodeValue)){
                    linkObj.type = 'text';
                  var hasFlagAry = nodeValue.match(self._patTextHasFlag);
                  for(var tempkey of hasFlagAry){
                    var noFlagMatches = tempkey.match(self._patTextNoFlag);
                    linkObj.index = i;
                    linkObj.key = noFlagMatches[0];
                    linkObj.value = nodeValue;
                    linkObj.id = lastId;
                    linkKey = linkObj.key;
                    if(linkKey.indexOf('.')!==-1){
                      linkKey = linkKey.split('.').join('-');
                    }
                    if(!self.linkDWN[linkKey]){
                      self.linkDWN[linkKey] = [];
                    }
                    self.linkDWN[linkKey].push(linkObj);
                  }
                }
                tempTree.childNodes.push(tempObj);
            } else if (curNode.nodeType === 1) {
                id = lastId + (self._flag + (tempId++));
                tempObj['type'] = 'node';
                tempObj['index'] = i;
                tempObj['value'] = arguments.callee.call(self, curNode, id);
                tempTree.childNodes.push(tempObj);
            }
        }
        return tempTree;
    },
    // 通过id获取节点
    getNode: function(str) {
        var self = this,
            node,
            children,
            target,
            ary,
            len;
        children = document.body.children;
        if(str.indexOf(self._flag)!==-1){
          ary = str.split(self._flag),
          ary.shift();
          len= ary.length;
          while (len>0) {
            node = children[ary.shift()];
            children = node.children;
            len--;
          }
        }else{
          node  = self.root;
        }
        return node;
    },
    // 获取当前数据的存取器对象
    getObjToAccessor: function() {
        var self = this;
        return this._createObjToAccessor(self.data);
    },
    // 将data转换为存取器对象
    _createObjToAccessor: function(data) {
        var self = this,
            data = data || {},
            tempData = {},
            key,
            options = {};
        for (key in data) {
            if (typeof data[key] !== 'object') {
                tempData = defProPerty.call(self,tempData, key, data ,self.linkDWN[key]);
            } else {
                tempData[key] = self._createObjToAccessor(data[key]);
            }
        }
        return tempData;
    },

    // 根据iniatlDomTree重新生成dom树
    render: function(initDomTree, data) {
        if (!flag) return;
        var self = this,
            elemTree = ((function createElem(initDomTree, data) {
                var tag = initDomTree.tag.toLowerCase(),
                    textElem = document.createElement(tag),
                    props = initDomTree.props,
                    texts = initDomTree.text,
                    childNodes = initDomTree.childNodes,
                    childNode,
                    key,
                    i = 0,
                    len,
                    prop,
                    textNode,
                    attrKey,
                    attrValue;
                for (len = props.length; i < len; i++) {
                    prop = props[i];
                    for (key in prop) {
                        if (self._patPropDirective.test(key)) {
                            attrKey = key.match(self._patPropDirective)[1];
                            attrValue = prop[key];
                            attrValue = attrValue.replace(self._patTextHasFlag, function(item) {
                                return resolveValue.call(self,item);
                            })
                        }else{
                          attrKey = key;
                          attrValue = prop[key];
                        }
                        textElem.setAttribute(attrKey, attrValue);
                    }
                }
                for (i = 0, len = childNodes.length; i < len; i++) {
                    childNode = childNodes[i];
                    if (childNode.type === 'text') {
                        var nodeValue = childNode.value;
                        if (self._patTextHasFlag.test(nodeValue)) {
                            var newValue = nodeValue.replace(self._patTextHasFlag, function(item) {
                                  return resolveValue.call(self,item);
                            });
                            nodeValue = newValue;
                        }
                        textNode = document.createTextNode(nodeValue);
                        textElem.appendChild(textNode);
                    } else if (childNode.type === 'node') {
                        textElem.appendChild(createElem(childNode.value))
                    }
                }
                return textElem;

            })(initDomTree, data))
        var id = initDomTree.id;
        var node  = self.getNode(id+'');
        node.parentNode.replaceChild(elemTree,node);
        flag = false;
    }

})
function resolveValue(item,newkey,newvalue) {
  var self = this,
  key = item.match(self._patTextNoFlag)[0],
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
        value = self.data[val];
      } else {
        value = value[val];
      }
    }
  } else {
    value = self.data[key];
  }
  return value;
}

// 生成单个存取器对象
function defProPerty(obj, key, defObj, linkAry) {
  var self = this;
    return Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        set: function(newValue) {
            var item,id,node,index;
            if(!!linkAry){
              for(item of linkAry){
                id = item.id;
                node = self.getNode(id);
                if(item.type =='prop'){
                  node.setAttribute(item.key,newValue);
                }else if(item.type == 'text'){
                  index = item.index;
                  key = item.key;
                  nodeValue = item.value;
                  childNode = node.childNodes[index];
                  childNode.nodeValue = nodeValue.replace(self._patTextHasFlag,function(item){
                    return  resolveValue.call(self,item,key,newValue)
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
