<template>
  <div>
    <embed :src="pdfUrl" type="application/pdf" width="100%" height="600px" />
  </div>
</template>

<script>
import jsPDF from "jspdf";
import { useAppStore } from "@/stores/app";
import { mapState } from "pinia";
import autoTable from "jspdf-autotable";
import { useDataStore } from "@/stores/data";
import { avrileSansRegularNormal } from "@/assets/AvrileSans-Regular-normal.js";

export default {
  data() {
    return {
      pdfUrl: null,
    };
  },

  computed: {
    ...mapState(useAppStore, ["project"]),
    ...mapState(useDataStore, [
      "checkedTrenchesNames",
      "checkedFieldNames",
      "selectedType",
      "projectPreferencesFieldsWithTranslation",
      "checkedTrenchesItemsSelectedTypeAndSearched",
    ]),
    headers() {
      return this.checkedFieldNames.map(
        (fieldName) => this.projectPreferencesFieldsWithTranslation[fieldName]
      );
    },

    rows() {
      // select only fields present in checkedFieldNames

      return this.checkedTrenchesItemsSelectedTypeAndSearched.map((item) => {
        let rows = [];
        this.checkedFieldNames.forEach(function (prop) {
          if (Object.prototype.hasOwnProperty.call(item, prop)) {
            rows.push(item[prop]);
          } else {
            rows.push("");
          }
        });
        return rows;
      });
    },
  },
  methods: {
    generatePDF() {
      // jsPDF docs are found here: http://raw.githack.com/MrRio/jsPDF/master/docs/

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "A4",
      });

      doc.addFileToVFS(
        "Avrile-SansRegular-Normal.ttf",
        avrileSansRegularNormal
      );
      doc.addFont(
        "Avrile-SansRegular-Normal.ttf",
        "avrileSansRegularNormal",
        "normal"
      );
      doc.setFont("avrileSansRegularNormal");

      // image
      doc.addImage("favicon.ico", "ico", 5, 6, 4, 4);

      // text is placed using x, y coordinates
      doc.setFontSize(16).text(this.project, 10, 10);

      // create a line under heading
      doc.setLineWidth(0.1).line(5, 11, 200, 11);

      // list of trenches
      doc.setFontSize(12).text(this.checkedTrenchesNames.join(", "), 5, 20, {
        align: "left",
        maxWidth: "75",
      });
      let dimensionsCheckedTrenchesNames = doc.getTextDimensions(
        this.checkedTrenchesNames.join(", ")
      );
      let positionVerticale = 15 + dimensionsCheckedTrenchesNames.h + 8;

      //selected type
      doc
        .setFont("helvetica", "italic")
        .setFontSize(12)
        .text(this.selectedType, 7, positionVerticale, {
          align: "left",
        });

      // table of items
      autoTable(doc, {
        head: [this.headers],
        body: this.rows,
        styles: {
          font: "avrileSansRegularNormal",
          fillColor: [255, 255, 255],
          lineColor: 240,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },

        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },

        margin: { top: positionVerticale + 4, letf: 5 },
      });

      doc.save(`${this.project}.pdf`);
      // FOR DEV MODE
      // this.pdfUrl = doc.output("datauristring");
    },
  },
};
</script>

<style scoped></style>
