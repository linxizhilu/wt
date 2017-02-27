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
        self._setLinkDataToNode(self.data);
    },
    getTree: function() {
        return this._createInitalDomTree(this.root);
    },
    getLinkDataToNode: function() {
        return this.linkDWN;
    },
    _setLinkDataToNode: function(data) {
        var self = this,
            data = data || self.data;
        self.linkDWN = self._createLinkDataToNode(data);
    },
    _createLinkDataToNode: function(data, lastKey) {
        var self = this,
            key,
            data = data || self.data,
            lastKey = lastKey || '',
            tempObj = {};
        for (key in data) {
            if (typeof data[key] === 'object') {
                tempObj[key] = arguments.callee.call(self, data[key], key + self._flag);
            } else {
                tempObj[key] = [];
            }
        }
        return tempObj;
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
            linkObj = {};
            linkObj.type = 'prop';
            linkObj.key = nodeName.match(self._patPropDirective)[1];
            linkObj.value = nodeValue;
            linkObj.id = lastId;
            linkKey = nodeValue.replace(self._patTextHasFlag,function(item){
              return item.match(self._patTextNoFlag);
            })
            if(linkKey.indexOf('.')===-1){
              self.linkDWN[linkKey].push(linkObj);
            }else{
              linkItem  = self.linkDWN;
              linkKey.split('.').forEach(function(i,item){
                linkItem = linkItem[item];
              })
            }
            function getLinkAryKey(obj,ary){
              var key,
                  tempObj = obj;
              while((key = ary.shift())!=null){
                tempObj[key]

              }
            }
            console.log(self.linkDWN);
        }
        childNodes = node.childNodes;
        for (i = 0, len = childNodes.length; i < len; i++) {
            curNode = childNodes[i],
                nodeValue = curNode.nodeValue,
                tempObj = {};
            if (curNode.nodeType === 3) {
                tempObj['type'] = 'text';
                tempObj['index'] = i;
                tempObj['value'] = curNode.nodeValue;
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
    getNode: function(str) {
        var self = this,
            node,
            children,
            target,
            ary;
        children = self.root.children;
        ary = str.split(self.flag);
        node = children[parseInt(ary.shift())]
        if (!!node) {
            return getNode(node, ary);
        } else {
            return root;
        }
    },
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
                tempData = self._defProPerty(tempData, key, data);
            } else {
                tempData[key] = self._createObjToAccessor(data[key]);
            }
        }

        return tempData;

    },
    // 生成单个存取器对象
    _defProPerty: function(obj, key, defObj, linkAry) {
        return Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            set: function(newValue) {
                var item;
                // for(item of linkAry){

                // }
                // document.write(key+'</br>');
                defObj[key] = newValue;
            },
            get: function() {
                return defObj[key];
            }
        })
    },
    // 根据iniatlDomTree重新生成dom树
    render: function(elem, initDomTree, data) {
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
        document.querySelector('body').remove();
        elem.appendChild(elemTree);
        flag = false;

    }

})
function resolveValue(item) {
  var self = this,
  key = item.match(self._patTextNoFlag)[0],
  value;
  if (key.indexOf('.') !== -1) {
    var tempAry = key.split('.'),
    i = 0,
    val, tempLinkObj;
    while ((val = tempAry[i++]) !== undefined) {
      if (!value) {
        value = self.data[val];
        tempLinkObj = self.linkDWN[val];
      } else {
        value = value[val];
        tempLinkObj = tempLinkObj[val];
      }
    }
  } else {
    value = self.data[key];
  }
  return value;
}
