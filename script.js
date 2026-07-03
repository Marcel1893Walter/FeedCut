const d = document.getElementById("d");
const vc = document.getElementById("vc");
const n = document.getElementById("n");

const z = document.getElementById("z");
const fz = document.getElementById("fz");
const vf = document.getElementById("vf");

const weg = document.getElementById("weg");
const anzahl = document.getElementById("anzahl");
const zeit = document.getElementById("zeit");

const clearBtn = document.getElementById("clearBtn");

let lastChanged = "";
let oldDiameter = "";

function num(el) {
    return parseFloat(el.value.replace(",", ".")) || 0;
}

function format2(v) {
    return v.toFixed(2).replace(".", ",");
}

function feedMode() {
    return document.querySelector('input[name="feedMode"]:checked').value;
}

function calculate() {

    const D = num(d);
    const VC = num(vc);
    let N = num(n);

    const Z = num(z);

    let FZ = num(fz);
    let VF = num(vf);

    const WEG = num(weg);
    const ANZAHL = Math.max(1, parseInt(anzahl.value) || 1);

    // -------------------
    // Drehzahl
    // -------------------

    if (lastChanged === "vc") {

        if (D > 0 && VC > 0) {

            N = Math.round((VC * 1000) / (Math.PI * D));
            n.value = N;

        }

    }

    if (lastChanged === "n") {

        if (D > 0 && N > 0) {

            vc.value = Math.round((Math.PI * D * N) / 1000);

        }

    }

    // -------------------
    // Vorschub
    // -------------------

    if (
        lastChanged === "vc" ||
        lastChanged === "n" ||
        lastChanged === "z"
    ) {

        if (feedMode() === "fz") {

            if (N > 0 && Z > 0 && FZ > 0) {

                VF = Math.round(N * Z * FZ);
                vf.value = VF;

            }

        } else {

            if (N > 0 && Z > 0 && VF > 0) {

                FZ = VF / (N * Z);
                fz.value = format2(FZ);

            }

        }

    }

    if (lastChanged === "fz") {

        if (N > 0 && Z > 0 && FZ > 0) {

            VF = Math.round(N * Z * FZ);
            vf.value = VF;

        }

    }

    if (lastChanged === "vf") {

        if (N > 0 && Z > 0 && VF > 0) {

            FZ = VF / (N * Z);
            fz.value = format2(FZ);

        }

    }

    // -------------------
    // Bearbeitungszeit
    // -------------------

    if (WEG > 0 && VF > 0) {

        const sec = ((WEG / VF) * 60) * ANZAHL;

        zeit.value = sec.toFixed(3).replace(".", ",");

    } else {

        zeit.value = "";

    }

}

// -------------------
// Durchmesser merken
// -------------------

d.addEventListener("focus", () => {
    oldDiameter = d.value;
});

// -------------------
// Durchmesser verlassen
// -------------------

d.addEventListener("blur", () => {

    if (d.value !== "") {
        d.value = format2(num(d));
    }

    if (d.value !== oldDiameter) {

        vc.value = "";
        n.value = "";

        z.value = "";
        fz.value = "";
        vf.value = "";

        weg.value = "";
        anzahl.value = "1";
        zeit.value = "";

        lastChanged = "";

    }

});

// -------------------
// fz formatieren
// -------------------

fz.addEventListener("blur", () => {

    if (fz.value !== "") {
        fz.value = format2(num(fz));
    }

});

// -------------------
// Anzahl prüfen
// -------------------

anzahl.addEventListener("blur", () => {

    let value = parseInt(anzahl.value);

    if (isNaN(value) || value < 1) {
        anzahl.value = "1";
    } else {
        anzahl.value = value;
    }

    calculate();

});

// -------------------
// Vorschubmodus
// -------------------

document.querySelectorAll('input[name="feedMode"]').forEach(radio => {

    radio.addEventListener("change", () => {

        calculate();

    });

});

// -------------------
// Live Berechnung
// -------------------

[
    vc,
    n,
    z,
    fz,
    vf,
    weg,
    anzahl
].forEach(field => {

    field.addEventListener("input", function () {

        lastChanged = this.id;

        calculate();

    });

});

// -------------------
// Löschen
// -------------------

clearBtn.addEventListener("click", () => {

    d.value = "";
    vc.value = "";
    n.value = "";

    z.value = "";
    fz.value = "";
    vf.value = "";

    weg.value = "";
    anzahl.value = "1";
    zeit.value = "";

    // Standardmodus
    const radioFz = document.querySelector('input[name="feedMode"][value="fz"]');
    if (radioFz) {
        radioFz.checked = true;
    }

    lastChanged = "";
    oldDiameter = "";

    d.focus();

});

// -------------------
// Initialisierung
// -------------------

window.addEventListener("load", () => {

    // Anzahl immer mit 1 starten
    if (anzahl.value === "") {
        anzahl.value = "1";
    }

    // Standardmodus = fz konstant
    const radioFz = document.querySelector('input[name="feedMode"][value="fz"]');
    if (radioFz) {
        radioFz.checked = true;
    }

});

// ===========================
// Service Worker
// ===========================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("./service-worker.js")
            .then(registration => {

                console.log("FeedCut bereit.");

                registration.addEventListener("updatefound", () => {

                    console.log("Neue Version gefunden.");

                });

            })
            .catch(error => {

                console.log(error);

            });

    });

}