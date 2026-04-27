"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const styles = ["1388649", "ST-1002", "ST-1003", "ST-2001", "ST-3001"];
    const colors = ["Navy", "Black", "White", "Olive", "Burgundy"];
    const colorFamilies = {
      Navy: "blue",
      Black: "black",
      White: "white",
      Olive: "green",
      Burgundy: "red",
    };

    const fabricTypes = [
      "Single Jersey",
      "Interlock",
      "Rib 1x1",
      "French Terry",
      "Woven Poplin",
    ];
    const buyers = ["BuyerA", "BuyerB", "BuyerC"];
    const seasons = ["SS25", "AW25"];
    const suppliers = ["SupplierA", "SupplierB", "SupplierC"];
    const factories = ["Factory1", "Factory2", "Factory3"];
    const washTypes = ["None", "Enzyme"];
    const brands = ["ZARA", "H&M", "NIKE", "ADIDAS"];
    const productCategories = ["Apparel"];
    const productSubCategories = ["T-Shirts", "Hoodies", "Tops", "Bottoms"];

    const records = [];

    for (let i = 1; i <= 1000; i++) {
      const style = styles[i % styles.length];
      const color = colors[i % colors.length];
      const fabric = fabricTypes[i % fabricTypes.length];
      const buyer = buyers[i % buyers.length];

      const orderQty = 5000 + (i % 20) * 500;
      const perFabCons = 1.25 + (i % 10) * 0.05;

      records.push({
        style,
        po: `PO-${9000 + i}`,
        color,
        fabric_type: fabric,
        buyer,
        season: seasons[i % seasons.length],
        supplier: suppliers[i % suppliers.length],
        factory: factories[i % factories.length],
        po_date: new Date(2025, i % 12, (i % 28) + 1),
        order_qty: orderQty,
        unit: "meters",
        actual_consumption_total: Math.round(orderQty * perFabCons),
        gsm: 140 + (i % 6) * 10,
        width_mm: 1450 + (i % 8) * 50,
        shrinkage_warp_pct: (3.5 + (i % 10) * 0.2).toFixed(1),
        shrinkage_weft_pct: (4.5 + (i % 10) * 0.25).toFixed(1),
        marker_efficiency_pct: (72 + (i % 14)).toFixed(1),
        wash_type: washTypes[i % washTypes.length],
        color_family: colorFamilies[color],
        articleNo: `ART-${10000 + i}`,
        brand: brands[i % brands.length],
        productCategory: productCategories[0],
        productSubCategory:
          productSubCategories[i % productSubCategories.length],
        per_fab_cons: perFabCons.toFixed(2),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("fact_fabric_consumption", records, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("fact_fabric_consumption", null, {});
  },
};
``;
