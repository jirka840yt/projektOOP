/**
 * Soubor: app.ts
 * Obsahuje logiku tříd a spouštěcí kód aplikace.
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
// --- 1. DEFINICE TŘÍD A VALIDACE ---
/// <reference path="data.ts" />
var Vozidlo = /** @class */ (function () {
    function Vozidlo(spz, zakladniCenaZaDen) {
        if (!spz || spz.trim() === "") {
            throw new Error("SPZ nesmí být prázdná.");
        }
        if (zakladniCenaZaDen <= 0) {
            throw new Error("Základní cena za den musí být větší než 0.");
        }
        this.spz = spz;
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
    Dodavka.prototype.spocitejCenuPronajmu = function (pocetDni) {
        var priplatekZaNosnost = Math.ceil(this.nosnostKg / 500) * 100;
        var cenaZaDenCelkem = this.zakladniCenaZaDen + priplatekZaNosnost;
        return cenaZaDenCelkem * pocetDni;
    };
    return Dodavka;
}(Vozidlo));
// --- 2. OŽIVENÍ OBJEKTŮ A POLYMORFISMUS V KONZOLI ---
var vozovyPark = [];
// Proměnná surovaDataVozidel je dostupná z data.ts
for (var _i = 0, surovaDataVozidel_1 = surovaDataVozidel; _i < surovaDataVozidel_1.length; _i++) {
    var data = surovaDataVozidel_1[_i];
    try {
        if (data.typ === "osobni") {
            vozovyPark.push(new OsobniAuto(data.spz, data.zakladniCena, data.jeLuxusni));
        }
        else if (data.typ === "dodavka") {
            vozovyPark.push(new Dodavka(data.spz, data.zakladniCena, data.nosnostKg));
        }
    }
    catch (error) {
        console.error("Chyba p\u0159i vytv\u00E1\u0159en\u00ED vozidla se SPZ ".concat(data.spz, ":"), error);
    }
}
var pocetDniPronajmu = 3;
console.log("--- KALKULACE PRON\u00C1JMU NA ".concat(pocetDniPronajmu, " DNY ---"));
for (var _a = 0, vozovyPark_1 = vozovyPark; _a < vozovyPark_1.length; _a++) {
    var vozidlo = vozovyPark_1[_a];
    var cena = vozidlo.spocitejCenuPronajmu(pocetDniPronajmu);
    console.log("Vozidlo [".concat(vozidlo.getSpz(), "]: Celkov\u00E1 cena = ").concat(cena, " K\u010D"));
}
