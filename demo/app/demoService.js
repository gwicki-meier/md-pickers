import DemoController from "./demoController";

export default angular.module("demo-app", [
    'mdPickers'
])
    .controller("demoController", DemoController)
    .name;