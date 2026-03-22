import MenuScene from "./menu";
import BootScene from "./BootScene";
import Platfromrunner from "./Platfromrunner";
import SpaceBattle  from "./SpaceBattle";

export default [
    BootScene,
    MenuScene,
    ...Platfromrunner,
    ...SpaceBattle
];