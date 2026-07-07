const parseNum = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const match = val.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }
    return 0;
};

// Simulate random data response from API
const responseData = [
    { Ano: "2026", Semana: "Semana 26", Valor: "100" },
    { Ano: "2026", Semana: "Semana 28", Valor: "95" },
    { Ano: "2026", Semana: "Semana 25", Valor: "98" },
    { Ano: "2026", Semana: "Semana 27", Valor: "90" },
];

const sorted = [...responseData].sort((a, b) => {
    const anoA = parseNum(a.Ano);
    const anoB = parseNum(b.Ano);
    const semA = parseNum(a.Semana);
    const semB = parseNum(b.Semana);
    if (anoA !== anoB) {
        return anoA - anoB;
    }
    return semA - semB;
});

const chartData = sorted.map(h => {
    const match = String(h.Semana).match(/\d+/);
    const semNum = match ? match[0] : h.Semana;
    return {
        name: `w${semNum}`,
        value: parseFloat(h.Valor) || 0
    };
});

console.log("Original Data:");
console.log(responseData.map(d => `${d.Ano} - ${d.Semana}`));
console.log("\nSorted Data mapped to X-Axis labels (name):");
console.log(chartData.map(d => d.name));
