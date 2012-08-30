var util = require("util");
var Parser = require("./parser");

function Component() {
  this.js = {};
};

/*
 * Components can define subclasses on-the-fly
 */

Component.define = function(name){

  function subcomponent() {
   subcomponent.super_.call(this); 
  }

  subcomponent.componentName = name;
  
  // class-level super_
  util.inherits(subcomponent, this);
  subcomponent.__proto__ = this;

  // instance-level super_ (shortcut for this.constructor.super_.prototype)
  subcomponent.prototype.super_ = this.prototype;

  return subcomponent;
};

Component.templateRoot = function(roots) {

  this.templateRoots = [];

  if (!Array.isArray(roots)) {
    roots = [roots];
  }

  roots.forEach(function(root,i){
    this.templateRoots.push(root);
  }, this);

  return this;
};

Component.templateXpath = function(){
  var ret = this.templateRoots.map(function(r){
   return util.format(".//h:templateId[@root='%s']/..", r);
  }).join(" | ");
  return ret;
}

Component.fields = function(parsers) {
  this.parsers = [];
  parsers.forEach(function(p, i){
    var np = new Parser();
    np.init.apply(np, p);
    this.parsers.push(np);
  }, this);

  return this;
};

Component.bubbleSteps = function(steps){
  if (!Array.isArray(steps)){
    steps = [steps];
  }
  this.bubbleSteps = steps;
};

Component.prototype.bubble = function(){
  this.constructor.bubbleSteps.forEach(function(step){
    step.call(this);
  }, this);
};

Component.prototype.setJs = function(path, val) {
  var parts = path.split(/\./)
    , hook = this.js
    , i;

  for (i=0; i < parts.length - 1; i++){
    hook = hook[parts[i]] || (hook[parts[i]] = {});
  }
  hook[parts[i]] = val;
}

Component.prototype.run = function(node) {
  this.constructor.parsers.forEach(function(p){
   p.run(this, node);
  }, this);
  return this;
};

Component.prototype.toString = function(){
  return JSON.stringify(this);
};

Component.prototype.toJSON = function(){
  var ret = {};
  Object.keys(this.js).forEach(function(k){
    ret[k] = this.js[k];
  },this);
  return ret;
};

module.exports = Component;
