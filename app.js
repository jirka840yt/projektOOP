/// <reference path="data.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// --- 1. DEFINICE TRID A VALIDACE ---
var Vozidlo = /** @class */ (function () {
    function Vozidlo(spz, zakladniCenaZaDen) {
        // Ocisteni vstupu
        var cistaSpz = spz.toUpperCase().replace(/\s+/g, "");
        // Kontrola delky
        if (cistaSpz.length !== 7 && cistaSpz.length !== 8) {
            throw new Error("SPZ musi obsahovat presne 7 nebo 8 znaku.");
        }
        // Kontrola povolenych znaku
        var spzRegex = /^[A-Z0-9]+$/;
        if (!spzRegex.test(cistaSpz)) {
            throw new Error("SPZ smi obsahovat pouze pismena a cislice.");
        }
        // Specificka pravidla pro 7mistnou SPZ
        if (cistaSpz.length === 7) {
            var posledniCtyriZnaky = cistaSpz.substring(3);
            var jenCislaRegex = /^[0-9]{4}$/;
            if (!jenCislaRegex.test(posledniCtyriZnaky)) {
                throw new Error("U standardni 7mistne SPZ musi byt posledni 4 znaky vyhradne cislice.");
            }
        }
        // Specificka pravidla pro 8mistnou SPZ
        if (cistaSpz.length === 8) {
            // Regularni vyraz, ktery kontroluje, zda retezec obsahuje alespoj jedno cislo (0-9)
            var obsahujeCisloRegex = /[0-9]/;
            if (!obsahujeCisloRegex.test(cistaSpz)) {
                throw new Error("Vlastni 8mistna SPZ musi obsahovat alespon jedno cislo.");
            }
        }
        // Zformatovani pro vypis
        this.spz = cistaSpz.substring(0, 3) + " " + cistaSpz.substring(3);
        // Validace ceny
        if (zakladniCenaZaDen <= 0) {
            throw new Error("Zakladni cena za den musi byt vetsi nez 0.");
        }
        this.zakladniCenaZaDen = zakladniCenaZaDen;
    }
    Vozidlo.prototype.getSpz = function () {
        return this.spz;
    };
    return Vozidlo;
}());
var OsobniAuto = /** @class */ (function (_super) {
    __extends(OsobniAuto, _super);
    function OsobniAuto(spz, zakladniCenaZaDen, jeLuxusni) {
        var _this = _super.call(this, spz, zakladniCenaZaDen) || this;
        _this.jeLuxusni = jeLuxusni;
        return _this;
    }
    OsobniAuto.prototype.getJeLuxusni = function () {
        return this.jeLuxusni;
    };
    OsobniAuto.prototype.spocitejCenuPronajmu = function (pocetDni) {
        var celkovaCena = this.zakladniCenaZaDen * pocetDni;
        if (this.jeLuxusni) {
            celkovaCena *= 1.25;
        }
        return celkovaCena;
    };
    return OsobniAuto;
}(Vozidlo));
var Dodavka = /** @class */ (function (_super) {
    __extends(Dodavka, _super);
    function Dodavka(spz, zakladniCenaZaDen, nosnostKg) {
        var _this = _super.call(this, spz, zakladniCenaZaDen) || this;
        if (nosnostKg <= 0) {
            throw new Error("Nosnost dodavky musi byt vetsi nez 0.");
        }
        _this.nosnostKg = nosnostKg;
        return _this;
    }
    Dodavka.prototype.getNosnostKg = function () {
        return this.nosnostKg;
    };
    Dodavka.prototype.spocitejCenuPronajmu = function (pocetDni) {
        var priplatekZaNosnost = Math.ceil(this.nosnostKg / 500) * 100;
        var cenaZaDenCelkem = this.zakladniCenaZaDen + priplatekZaNosnost;
        return cenaZaDenCelkem * pocetDni;
    };
    return Dodavka;
}(Vozidlo));
// --- 2. PROPOJENI S DOM A DYNAMIKA ---
var vozovyPark = [];
var htmlGrid = document.getElementById("vehicleGrid");
var inputPocetDni = document.getElementById("pocetDni");
var formAddVehicle = document.getElementById("addVehicleForm");
var selectTyp = document.getElementById("typVozidla");
var inputZakladniCena = document.getElementById("zakladniCena");
var boxLuxus = document.getElementById("boxLuxus");
var inputJeLuxusni = document.getElementById("jeLuxusni");
var boxNosnost = document.getElementById("boxNosnost");
var inputNosnost = document.getElementById("nosnost");
var nahledCenyElement = document.getElementById("cenaNahled");
function nactiDataZDatabaze() {
    for (var _i = 0, surovaDataVozidel_1 = surovaDataVozidel; _i < surovaDataVozidel_1.length; _i++) {
        var data = surovaDataVozidel_1[_i];
        if (data.typ === "osobni") {
            vozovyPark.push(new OsobniAuto(data.spz, data.zakladniCena, data.jeLuxusni));
        }
        else if (data.typ === "dodavka") {
            vozovyPark.push(new Dodavka(data.spz, data.zakladniCena, data.nosnostKg));
        }
    }
}
function prekesliRozhrani() {
    htmlGrid.innerHTML = "";
    var pocetDni = parseInt(inputPocetDni.value) || 1;
    for (var _i = 0, vozovyPark_1 = vozovyPark; _i < vozovyPark_1.length; _i++) {
        var vozidlo = vozovyPark_1[_i];
        var cena = vozidlo.spocitejCenuPronajmu(pocetDni);
        var typText = "";
        var specifickyUdaj = "";
        if (vozidlo instanceof OsobniAuto) {
            typText = "Osobni auto";
            specifickyUdaj = vozidlo.getJeLuxusni() ? "Trida: Luxusni VIP" : "Trida: Standardni";
        }
        else if (vozidlo instanceof Dodavka) {
            typText = "Nakladni dodavka";
            specifickyUdaj = "Nosnost: ".concat(vozidlo.getNosnostKg(), " kg");
        }
        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML = "\n            <h3>".concat(typText, "</h3>\n            <p><strong>SPZ:</strong> ").concat(vozidlo.getSpz(), "</p>\n            <p><strong>Specifikace:</strong> ").concat(specifickyUdaj, "</p>\n            <div class=\"price\">").concat(cena.toLocaleString(), " Kc</div>\n            <p style=\"font-size: 0.8rem; color: #666; margin-top: 5px;\">Cena za ").concat(pocetDni, " dny</p>\n        ");
        htmlGrid.appendChild(card);
    }
}
// Funkce pro okamzity vypocet nahledu ve formulari
function aktualizujNahledCeny() {
    var cenaInput = parseInt(inputZakladniCena.value) || 0;
    var pocetDni = parseInt(inputPocetDni.value) || 1;
    if (cenaInput <= 0) {
        nahledCenyElement.innerText = "0 Kc";
        return;
    }
    try {
        var docasneVozidlo = void 0;
        var fiktivniSpz = "AAA 1111";
        if (selectTyp.value === "osobni") {
            docasneVozidlo = new OsobniAuto(fiktivniSpz, cenaInput, inputJeLuxusni.checked);
        }
        else {
            var nosnost = parseInt(inputNosnost.value) || 1;
            docasneVozidlo = new Dodavka(fiktivniSpz, cenaInput, nosnost > 0 ? nosnost : 1);
        }
        var vyslednaCena = docasneVozidlo.spocitejCenuPronajmu(pocetDni);
        nahledCenyElement.innerText = vyslednaCena.toLocaleString() + " Kc";
    }
    catch (error) {
        nahledCenyElement.innerText = "-";
    }
}
// Udalosti pro aktualizaci nahledu
inputZakladniCena.addEventListener("input", aktualizujNahledCeny);
inputJeLuxusni.addEventListener("change", aktualizujNahledCeny);
inputNosnost.addEventListener("input", aktualizujNahledCeny);
inputPocetDni.addEventListener("input", function () {
    prekesliRozhrani();
    aktualizujNahledCeny();
});
selectTyp.addEventListener("change", function () {
    if (selectTyp.value === "osobni") {
        boxLuxus.classList.remove("hidden");
        boxNosnost.classList.add("hidden");
    }
    else {
        boxLuxus.classList.add("hidden");
        boxNosnost.classList.remove("hidden");
    }
    aktualizujNahledCeny();
});
formAddVehicle.addEventListener("submit", function (udalost) {
    udalost.preventDefault();
    var spz = document.getElementById("spz").value;
    var cena = parseInt(inputZakladniCena.value);
    try {
        if (selectTyp.value === "osobni") {
            vozovyPark.push(new OsobniAuto(spz, cena, inputJeLuxusni.checked));
        }
        else {
            var nosnost = parseInt(inputNosnost.value);
            vozovyPark.push(new Dodavka(spz, cena, nosnost));
        }
        prekesliRozhrani();
        formAddVehicle.reset();
        aktualizujNahledCeny();
    }
    catch (error) {
        alert("Chyba pri vytvareni vozidla: " + error.message);
    }
});
nactiDataZDatabaze();
prekesliRozhrani();
aktualizujNahledCeny();
