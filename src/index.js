import { newRepair, toggleView, fixAll } from './newRepair';
import './style.css';

let newButton = document.getElementById('new-button')
    newButton.addEventListener('click', () => { newRepair(); })

let toggleButton = document.getElementById('toggle-button')
    toggleButton.addEventListener('click', () => { toggleView(toggleButton); })

let entradaBox = document.getElementById('entrada')
    entradaBox.addEventListener('keyup', () => { fixAll(entradaBox.value); })