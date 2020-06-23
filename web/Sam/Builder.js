function Builder(construction, materials){
    const settler = Array.prototype.slice;

    if(typeof materials !== 'object' && typeof materials !== 'function') materials = {};

    function Worker(plan){
        // Consolidate arguments into single plan
        // plan will be an Array if multiple arguments are supplied
        if(arguments.length > 1) plan = settler.call(arguments);

        if(this instanceof Worker){
            // Treat as an object
            this.clean = function(){
                this.constructor = Worker;
                this.plan = plan;
                this.materials = {};
                Object.assign(this.materials, Worker.materials);
                return this;
            };
            this.build = function(){
                let args = settler.call(arguments);
                args.unshift(this.plan);
                return construction.apply(this, args);
            };
            this.clean();

        }else{
            // Return a factory that can be used instead of an instance
            function Factory(){
                let args = settler.call(arguments);
                args.unshift(Factory.plan);
                if(Factory.materials.plan !== undefined) Factory.materials.plan = Factory.plan;
                return construction.apply(Factory.materials, args);
            }
            Factory.clean = function(){
                Factory.constructor = Worker;
                Factory.plan = plan;
                Factory.materials = {};
                Object.assign(Factory.materials, Worker.materials);
                return Factory;
            };
            Factory.build = Factory;
            Factory.clean();
            return Factory;
        }
    }
    Worker.materials = materials;
    return Worker;
}
