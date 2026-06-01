/**
 * Soubor: app.ts
 * Obsahuje logiku tříd a spouštěcí kód aplikace s podrobným zobrazením specifikací.
 */
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
/// <reference path="data.ts" />
// --- 1. DEFINICE TŘÍD A VALIDACE ---
var Vozidlo = /** @class */ (function () {
    function Vozidlo(spz, zakladniCenaZaDen) {
        // 1. Očištění vstupu
        var cistaSpz = spz.toUpperCase().replace(/\s+/g, "");
        // 2. Kontrola správné délky
        if (cistaSpz.length !== 7 && cistaSpz.length !== 8) {
            throw new Error("SPZ musí obsahovat přesně 7 nebo 8 znaků (nepočítaje mezery).");
        }
        // 3. Kontrola povolených znaků (jen písmena a čísla)
        var spzRegex = /^[A-Z0-9]+$/;
        if (!spzRegex.test(cistaSpz)) {
            throw new Error("SPZ smí obsahovat pouze písmena a číslice.");
        }
        // 4. NOVÉ: Kontrola, zda poslední 4 znaky u 7místné SPZ jsou pouze číslice
        if (cistaSpz.length === 7) {
            // Vezmeme podřetězec od indexu 3 do konce (tedy poslední 4 znaky)
            var posledniCtyriZnaky = cistaSpz.substring(3);
            // Regulární výraz pro přesně 4 číslice
            var jenCislaRegex = /^[0-9]{4}$/;
            if (!jenCislaRegex.test(posledniCtyriZnaky)) {
                throw new Error("U standardní 7místné SPZ musí být poslední 4 znaky výhradně číslice (např. 1A1 1234).");
            }
        }
        // 5. Zformátování s mezerou pro hezký výpis
        this.spz = cistaSpz.substring(0, 3) + " " + cistaSpz.substring(3);
        // Validace ceny
        if (zakladniCenaZaDen <= 0) {
            throw new Error("Základní cena za den musí být větší než 0.");
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
    // NOVÉ: Getter pro získání informace, zda je auto luxusní
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
            throw new Error("Nosnost dodávky musí být větší než 0.");
        }
        _this.nosnostKg = nosnostKg;
        return _this;
    }
    // NOVÉ: Getter pro získání nosnosti dodávky
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
// --- 2. OŽIVENÍ OBJEKTŮ A POLYMORFISMUS V KONZOLI ---
var vozovyPark = [];
var htmlGrid = document.getElementById("vehicleGrid");
var inputPocetDni = document.getElementById("pocetDni");
var formAddVehicle = document.getElementById("addVehicleForm");
var selectTyp = document.getElementById("typVozidla");
var boxLuxus = document.getElementById("boxLuxus");
var boxNosnost = document.getElementById("boxNosnost");
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
// UPRAVENÁ FUNKCE: Nyní dynamicícky zjišťuje typ a vytahuje specifická data
function prekesliRozhrani() {
    htmlGrid.innerHTML = "";
    var pocetDni = parseInt(inputPocetDni.value) || 1;
    for (var _i = 0, vozovyPark_1 = vozovyPark; _i < vozovyPark_1.length; _i++) {
        var vozidlo = vozovyPark_1[_i];
        var cena = vozidlo.spocitejCenuPronajmu(pocetDni);
        var typText = "";
        var specifickyUdaj = "";
        // Pomocí instanceof zjistíme přesný typ potomka a bezpečně zavoláme jeho getter
        if (vozidlo instanceof OsobniAuto) {
            typText = "Osobní auto";
            specifickyUdaj = vozidlo.getJeLuxusni() ? "Třída: Luxusní VIP" : "Třída: Standardní";
        }
        else if (vozidlo instanceof Dodavka) {
            typText = "Nákladní dodávka";
            specifickyUdaj = "Nosnost: ".concat(vozidlo.getNosnostKg(), " kg");
        }
        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML = "\n            <h3>".concat(typText, "</h3>\n            <p><strong>SPZ:</strong> ").concat(vozidlo.getSpz(), "</p>\n            <p><strong>Specifikace:</strong> ").concat(specifickyUdaj, "</p>\n            <div class=\"price\">").concat(cena.toLocaleString(), " K\u010D</div>\n            <p style=\"font-size: 0.8rem; color: #666; margin-top: 5px;\">Cena za ").concat(pocetDni, " dny</p>\n        ");
        htmlGrid.appendChild(card);
    }
}
inputPocetDni.addEventListener("input", function () {
    prekesliRozhrani();
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
});
formAddVehicle.addEventListener("submit", function (udalost) {
    udalost.preventDefault();
    var spz = document.getElementById("spz").value;
    var cena = parseInt(document.getElementById("zakladniCena").value);
    try {
        if (selectTyp.value === "osobni") {
            var jeLuxusni = document.getElementById("jeLuxusni").checked;
            vozovyPark.push(new OsobniAuto(spz, cena, jeLuxusni));
        }
        else {
            var nosnost = parseInt(document.getElementById("nosnost").value);
            vozovyPark.push(new Dodavka(spz, cena, nosnost));
        }
        prekesliRozhrani();
        formAddVehicle.reset();
    }
    catch (error) {
        alert("Chyba při vytváření vozidla: " + error.message);
    }
});
nactiDataZDatabaze();
prekesliRozhrani();
