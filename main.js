
function DABManager(){
        this.activityCount = 0;
        this.currentLocation = window.location;
        this.activeObservers = [];
        this.activeIntervals = [];
        this.activityContexts = {};
        this.pageActivityList = [];
}

DABManager.prototype.startActivity = function(name){
    try{
        this.activityContexts[name].initFunc();
    }
    catch(e){
        console.log("Activity failed to start: "+name+"\nError: ", e);
    }
}

DABManager.prototype.registerActivity = function({name, initFunc, intervalList=null, observer=null}){
    try{
        this.pageActivityList.push(name);

        this.activityContexts[name] = {
            initFunc: initFunc,
        } 

        this.activityCount += 1;
        console.log("ACTIVITY REGISTERED: " + name);

        if(intervalList !== null) {
            this.createInterval(name, intervalList);
        }
        else{
            this.startActivity(name);
        }  
        
        if(observer != null){
            this.createObserver(name, observer.target, observer.config, observer.callback);
        }
    }
    catch(e){
        console.log(e);
    }
}

DABManager.prototype.createObserver = function(activity, target, config, callback){
    const observer = new MutationObserver(callback);
    observer.observe(target, config);
    this.activeObservers.push({activity: activity, observer: observer, target: target, config: config, callback: callback});
    this.activityContexts[activity].observer = observer;
}

DABManager.prototype.stopObserver = function(activity){
    this.activityContexts[activity].observer.disconnect();
    let index = this.activeObservers.findIndex(e => e.activity == activity);
    this.activeObservers.splice(index, 1);
}

DABManager.prototype.createInterval = function(activity, list){

    let managerInstance = this;
    list = Array.isArray(list) ? list.join(",") : list;
    
    var interval = setInterval(function(){
        console.log("Interval running. Checking for: ", list);
        if($(list).length){
            managerInstance.startActivity(activity);
            let index = managerInstance.activeIntervals.findIndex(e => e.activity == activity);
            managerInstance.activeIntervals.splice(index, 1);
            clearInterval(interval);
        }
    }, 250);

    this.activeIntervals.push({activity: activity, callback: arguments.callee, contextList: list});
    this.activityContexts[activity].interval = this.activeIntervals[this.activeIntervals.length -1];
}

if(!window.DabManager){
    window.ActivityManager = new DABManager();
}

// FOR TESTING PURPOSES
var myActivity = {
    name: "DAB123",
    initFunc: function(){
        console.log("Activity Running")
    },
    intervalList: ["body", "head"]
}
window.ActivityManager.registerActivity(myActivity);

window.ActivityManager.registerActivity({
    name: "DAB456",
    initFunc: function(){
        console.log("Activity running", "DAB456")
    },
    intervalList: [".row, #body-content"],
    observer: {
        target: document.getElementById('body-content'),
        config: { attributes: true, childList: true, subtree: true },
        callback: (mutationList, observer) => {
            console.log("Observer Running");
        }
    }
})