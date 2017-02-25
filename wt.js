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
    _patTextHasFlag:/(\{\{)([^\}]+)(\}\})/gi,
    _patTextNoFlag:/([^\{\}]+)(?=\}\})/ig,
    init:function(){
      var self = this;
      self._setLinkDataToNode();
    },
    getTree: function() {
        return this._getCurDomObj(this.root);
    },
    getLinkDataToNode:function(){
      return this.linkDWN;
    },
    _setLinkDataToNode: function() {
      var self = this;
        self.linkDWN = self._createLinkDataToNode(self.data);
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
    _getCurDomObj: function(node, id) {
        var self = this,
            lastId = id || 0,
            tempTree = {
                id: lastId,
                tag: "",
                props: [],
                children: [],
                text: []
            },
            attrMap,
            childNodes,
            tempId = 0,
            i,
            len,
            tempObj,
            curNode;
        tempTree.tag = node.tagName;
        for (i = 0, len = (attrMap = node.attributes).length; i < len; i++) {
            tempObj = {};
            tempObj[attrMap[i].nodeName] = attrMap[i].nodeValue;
            tempTree.props.push(tempObj);
        }
        childNodes = node.childNodes;
        for (i = 0, len = childNodes.length; i < len; i++) {
            curNode = childNodes[i],
            nodeValue = curNode.nodeValue,
            tempObj = {};
            if (curNode.nodeType === 3) {
                tempObj['id']=lastId;
                tempObj['type'] = 'text';
                tempObj['index'] = i;
                if (!self._patCgLine.test(nodeValue)) {
                  if(self._patTextHasFlag.test(nodeValue)){
                    var newValue = nodeValue.replace(self._patTextHasFlag,function(item){
                      var key = item.match(self._patTextNoFlag)[0],value;
                      if(key.indexOf('.')!==-1){
                        var tempAry = key.split('.'),i=0,val,tempLinkObj;
                        while ((val=tempAry[i++]) !== undefined) {
                          if(!value){
                            value = self.data[val];
                            tempLinkObj = self.linkDWN[val];
                          }else{
                            value = value[val];
                            tempLinkObj=tempLinkObj[val];
                          }
                        }
                        tempLinkObj.push(tempObj);
                      }else{
                        value = self.data[key];
                        self.linkDWN[key].push(tempObj);
                      }
                      return value;
                    });
                    curNode.nodeValue = newValue;

                    tempTree.text.push({
                      index: i,
                      value: curNode.nodeValue
                    });
                  }
                }
                continue;
            } else if (curNode.nodeType === 1) {
                id = lastId + (self._flag + (tempId++));
                tempTree.children.push(arguments.callee.call(self, curNode, id));
            }
        }
        return tempTree;
    },
    getNode: function(str) {
        var node,
            children,
            target,
            ary;
        children = this.root.children;
        ary = str.split(this.flag);
        node = children[parseInt(ary.shift())]
        if (!!node) {
            return getNode(node, ary);
        } else {
            return root;
        }
    }
})
