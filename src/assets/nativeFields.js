export const fieldsSchema = {
  iDigFieldsRules: {
    comment:
      "The format iDig uses for data is based on Dublin Core. The standard 15 Dublin Core elements (see below) should only contain human readable text. All additional fields exported by iDig will begin with one of the Dublin Core prefixes (e.g. DateEarliest). All custom fields you create should begin with different prefixes.",
    standardDublinCoreFields: {
      Type: "The nature or genre of the resource. (This field is used for the item's type.)",
      Coverage:
        "The spatial or temporal topic of the resource, the spatial applicability of the resource, or the jurisdiction under which the resource is relevant.",
      Identifier:
        "An unambiguous reference to the resource within a given context. (This field is used as the name of an item.)",
      Title:
        "A name given to the resource. (This field is shown in the item list.)",
      Creator: " An entity primarily responsible for making the resource.",
      Date: " A point or period of time associated with an event in the lifecycle of the resource. (This field is automatically generated based on the current locale and time zone.)",
      Description: " An account of the resource.",
      Relation:
        " A related resource. (This field is automatically generated and consists of a list of related items.)",
      Format:
        "The file format, physical medium, or dimensions of the resource. (This field is used for the dimensions of an item).",
      Contributor:
        "An entity responsible for making contributions to the resource.",
      Language: " A language of the resource.",
      Publisher: "An entity responsible for making the resource available.",
      Source:
        " A related resource from which the described resource is derived. (This field is used for the document name.)",
      Subject: " The topic of the resource.",
      Rights: " Information about rights held in and over the resource.",
    },

    iDigFieldsProperties: {
      comment: "Fields can have the following properties attached to them:",
      properties: {
        label: "the displayed field name", // ne doit plus être utilisé ? remplacé par labels ?

        multivalue:
          "[ARRAY TYPE].   (allows multiple values from a valuelist to be selected)",

        valuelist:
          "(either an fixed list of values or an empty list which dynamically creates a list based on what you type)",
        // limited to type

        multitype:
          "(creates dynamic values for valuelists from all types) ex CoverageTemporal, Excavators, Workmen, Room, Sondage (all valuelist,multivalue,   multitype)",
        // not limited to a type, can't be without "valuelist"?
        multiline: "(used for fields with multiple lines like Description)",
        number:
          "[only use once](the field value should be interpreted as a number)",
        mandatory: "[never use](a value should always exist in this field)",
        regexp: "[never use](a regular expression to check field validity).",
      },
    },
  },
  IdentifierUUID: {
    field: "IdentifierUUID",
    labels: {
      en: "universally unique identifier",
    },
    tips: {
      en: "universally unique identifier",
    },
  },
  Source: {
    field: "Source",
    type: "ExtraFields",
    labels: {
      en: "Source",
      fr: "Source",
    },
    tips: {
      en: "original Trench of the iTems",
      fr: "Secteur d'origine de l'élément",
    },
  },
  // "group": "Status",
  RightsSidelined: {
    type: "boolean",
    group: "Status Section",
    labels: {
      fr: "Invisible",
      it: "Invisibile",
      de: "Unsichtbar",
      en: "Sidelined",
      el: "",
    },
    tips: {
      fr: "Permet de ne pas faire figurer les polygones ou points sur le plan",
      it: "Rende invisibili poligoni e punti sulla pianta",
      de: "Ermöglicht es, Polygone oder Punkte auf dem Plan auszublenden",
      en: "Allows to sideline polygons or points so that they are not displayed on the map",
      el: "",
    },
  },
  RightsLocked: {
    type: "boolean",
    labels: {
      en: "Locked",
      fr: "Sécurisé",
    },
    tips: {
      en: "determines if you can edit the item or not",
    },
  },
  RightsTrashed: {
    type: "boolean",
    labels: {
      en: "Trashed",
      fr: "Ecarté",
    },
    tips: {
      en: "if the item is in the trash or not  (use by iDig app)",
      fr: "si l'élément est dans la corbeille de l'iPad ou non",
    },
  },
  RightsDeleted: {
    type: "boolean",
    labels: {
      en: "Deleted",
      fr: "Supprimé",
    },
    tips: {
      en: "is deleted (use by iDig app)",
      fr: "est supprimé (utilisé par iDig app)",
    },
  },
  RightsStatus: {
    labels: {
      fr: "Status",
      it: "Status",
      de: "Status",
      en: "Status",
    },
    valuelists: [
      { fr: "Prêt", en: "Ready" },
      { fr: "Terminé", en: "All Done" },
      { fr: "Attention", en: "Attention" },
      { fr: "A traiter", en: "Will Process" },
      { fr: "En attente", en: "Waiting" },
      { fr: "En cours", en: "Open" },
      { fr: "Clos", en: "Closed" },
      { fr: "Indéterminé", en: "Undefined" },
      { fr: "A cataloguer", en: "Will Catalog" },
      // { fr: "Archivé", en: "Archived" }, // only used on iPad
    ],
    valuelist: ["Ready", "All Done", "Attention", "Will Process", "Waiting"],
    tips: {
      en: "Used for filtering and coloring items by status",
      fr: "Utilisé pour colorer et filtrer les éléments par status",
    },
  },

  // IMAGES - ATTACHMENTS
  FormatImage: {
    field: "FormatImage",
    labels: {
      en: "image representation",
    },
    tips: {
      en: "a path to an image representation",
    },
  },
  FormatImageHeight: {
    field: "FormatImageHeight",
    labels: {
      en: "image height",
    },
    tips: {
      en: "height of the image",
    },
  },
  FormatImageWidth: {
    field: "FormatImageWidth",
    labels: {
      en: "image width",
    },
    tips: {
      en: "width of the image",
    },
  },
  FormatImageAnnotations: {
    field: "[FormatImageAnnotations",
    labels: {
      en: "annotations",
    },
    tips: {
      en: "annotations for the item",
    },
  },
  FormatPDF: {
    field: "[FormatPDF",
    labels: {
      en: "PDF representation",
    },
    tips: {
      en: "a path to a pdf representation",
    },
  },
  RelationAttachments: {
    field: "RelationAttachments",
    labels: {
      en: "Attachments",
      fr: "Images",
    },
    tips: {
      en: "the files attached to the item",
      fr: "fichier attaché à l'élément",
    },
  },
  RelationLinks: {
    field: "RelationLinks",
    type: "ExtraFields",
    labels: {
      en: "URLs",
    },
    tips: {
      en: "URLs to other representations of the item",
    },
  },
  FormatImageTransformXYZ: {
    field: "FormatImageTransformXYZ",
    labels: {
      en: "Image Transform XYZ",
      fr: "Transformation d'image XYZ",
    },
    tips: {
      en: "image transformation data in XYZ format",
      fr: "données de transformation d'image au format XYZ",
    },
  },
  FormatImageTransformGEO: {
    field: "FormatImageTransformGEO",
    labels: {
      en: "Image Transform GEO",
      fr: "Transformation d'image GEO",
    },
    tips: {
      en: "image transformation data in GEO format",
      fr: "données de transformation d'image au format GEO",
    },
  },
  RelationURLs: {
    field: "RelationURLs",
    labels: {
      en: "URLs",
      fr: "URLs",
    },
    tips: {
      en: "related URLs of the item",
      fr: "URLs associées à l'élément",
    },
  },

  // "group": "Relationships",
  // les relations c'est uniquement dans la même trench ?
  // [sur, sous, à côté de, coupe, coupé par, postérieur à, antérieur à, contemporain de, appartient à, inclue]
  // Can be also :     "RelationIsAbove:",     "RelationIsBelow:",     "RelationIsNextTo:",    "RelationIsAfter:",    "RelationIsBefore:",    RelationIsCoevalWith:",     "RelationBelongsTo:",    "RelationIncludes:",    "[RelationCuts:]",    "[RelationIsCutBy:]",
  RelationIsAboveUUID: {
    labels: { fr: "Sur" },
    type: "link",
    goupe: "Relationships",
  },
  RelationIsBelowUUID: {
    labels: { fr: "sous" },
    type: "link",
    goupe: "Relationships",
  },
  RelationIsNextToUUID: {
    labels: { fr: "à côté de" },
    type: "link",
    goupe: "Relationships",
  },
  RelationCutsUUID: {
    labels: { fr: "coupe" },
    type: "link",
    goupe: "Relationships",
  },
  RelationIsCutByUUID: {
    labels: { fr: "coupé par" },
    type: "link",
    goupe: "Relationships",
  },
  RelationIsAfterUUID: {
    labels: { fr: "postérieur à" },
    type: "link",
    goupe: "Relationships",
  },
  RelationIsBeforeUUID: {
    labels: { fr: "antérieur à" },
    type: "link",
    goupe: "Relationships",
  },
  RelationIsCoevalWithUUID: {
    labels: { fr: "contemporain de" },
    type: "link",
    goupe: "Relationships",
  },
  RelationBelongsToUUID: {
    labels: { fr: "appartient à" },
    type: "link",
    goupe: "Relationships",
  },
  RelationIncludesUUID: {
    labels: { fr: "inclue" },
    type: "link",
    goupe: "Relationships",
  },

  // COVERAGE TEMPORAL DATE
  CoverageUTC: {
    type: "DateUTC",
    labels: {
      en: "date",
      fr: "date",
    },
    tips: {
      en: "a date or date range in lenient UTC format",
      fr: "une date ou une plage de dates au format UTC souple",
    },
  },
  DateUTC: {
    type: "DateUTC",
    labels: {
      en: "date",
      fr: "date",
    },
    tips: {
      en: "the date or date range of the item in UTC format",
      fr: "la date ou la plage de dates de l'élément au format UTC",
    },
  },
  DateEarliest: {
    type: "DateUTC",
    labels: {
      en: "start date",
      fr: "date de début",
    },
    tips: {
      en: "the start date of the item in UTC format",
      fr: "la date de début de l'élément au format UTC",
    },
  },
  DateLatest: {
    type: "DateUTC",
    labels: {
      en: "end date",
      fr: "date de fin",
    },
    tips: {
      en: "the end date of the item in UTC format",
      fr: "la date de fin de l'élément au format UTC",
    },
  },
  DateTimeZone: {
    type: "Date?",
    labels: {
      en: "time zone",
      fr: "fuseau horaire",
    },
    tips: {
      en: "the time zone name",
      fr: "le nom du fuseau horaire",
    },
  },
  DateModified: {
    type: "DateUTC",
    labels: {
      en: "modification date",
      fr: "date de modification",
    },
    tips: {
      en: "the modification date of the item in UTC format",
      fr: "la date de modification de l'élément au format UTC",
    },
  },
  CoverageTemporal: {
    type: "Date?",
    field: "[CoverageTemporal/Temporal]",
    typeiDig: "ExtraFields",
    labels: {
      en: "coverage temporelle",
      fr: "couverture temporelle",
    },
    tips: {
      en: "a human readable date, phase, or period name for the item",
      fr: "une date, une phase ou un nom de période lisible par l'homme pour l'élément",
    },
  },
  CoverageEarliest: {
    type: "optionalAutomatedFields",
    field: "[CoverageEarliest/TemporalEarliest]",
    labels: {
      en: "couverture la plus ancienne",
      fr: "couverture la plus ancienne",
    },
    tips: {
      en: "a date in lenient UTC format (optional month, day, and time, negative years for BC dates)",
      fr: "une date au format UTC souple (mois, jour et heure optionnels, années négatives pour les dates av. J.-C.)",
    },
  },
  CoverageLatest: {
    type: "optionalAutomatedFields",
    field: "[CoverageLatest/TemporalLatest]",
    labels: {
      en: "couverture la plus récente",
      fr: "couverture la plus récente",
    },
    tips: {
      en: "a date in lenient UTC format",
      fr: "une date au format UTC souple",
    },
  },

  CoverageTemporalUUID: {
    field: "CoverageTemporalUUID",
    labels: {
      en: "Temporal UUID",
      fr: "UUID temporel",
    },
    tips: {
      en: "Unique identifier for the temporal coverage",
      fr: "Identifiant unique pour la couverture temporelle",
    },
  },

  // COVERAGE SPATIAL
  // TODO indentify those that are generated during iPad export
  CoverageSerialized: {
    field: "CoverageSerialized",
    labels: {
      en: "spatial point data",
      fr: "Données topo iDig",
    },
    tips: {
      en: "raw spatial point data (including fields set by the total station)",
      fr: "Données ponctuelles spatiales brutes (incluant les champs définis par la station totale)",
    },
  },

  //  “convenience” fields generated from the “source of truth” inside CoverageSerialized.

  CoverageXYZ: {
    field: "CoverageXYZ",
    labels: {
      en: "XYZ Coverage",
      fr: "Couverture XYZ",
    },
    tips: {
      en: "coverage data in XYZ format",
      fr: "données de couverture au format XYZ",
    },
  },
  CoverageGEO: {
    field: "CoverageGEO",
    labels: {
      en: "GEO Coverage",
      fr: "Couverture GEO",
    },
    tips: {
      en: "coverage data in GEO format",
      fr: "données de couverture au format GEO",
    },
  },
  CoverageGeoJSON: {
    comment: "not used?",
    field: "CoverageGeoJSON",
    labels: {
      en: "GeoJSON Coverage",
      fr: "Couverture GeoJSON",
    },
    tips: {
      en: "coverage data in GeoJSON format",
      fr: "données de couverture au format GeoJSON",
    },
  },

  CoverageAltitude: {
    field: "CoverageAltitude",
    labels: {
      en: "z elevation range",
      fr: "Plage d'élévation z",
    },
    tips: {
      en: "the z elevation range of the item",
      fr: "La plage d'élévation z de l'élément",
    },
  },
  CoverageArea: {
    field: "CoverageArea",
    labels: {
      en: "area",
      fr: "Superficie",
    },
    tips: {
      en: "the area of the item's geometry",
      fr: "La superficie de la géométrie de l'élément",
    },
  },
  CoverageEnvelope: {
    field: "CoverageEnvelope",
    labels: {
      en: "bounding box",
      fr: "Boîte englobante",
    },
    tips: {
      en: "the bounding box of the item specified as 'Envelope(xmin, xmax, ymax, ymin)'",
      fr: "La boîte englobante de l'élément spécifiée sous forme de 'Envelope(xmin, xmax, ymax, ymin)'",
    },
  },
  CoverageEnvelopeGEO: "not in comments",
  CoverageEnvelopeXYZ: "not in comments",
  CoverageCropped: "not in comments",

  CoveragePosition: {
    field: "CoveragePosition",
    labels: {
      en: "centroid",
      fr: "Centre de gravité",
    },
    tips: {
      en: "the 2d centroid of the item's geometry",
      fr: "Le centre de gravité 2D de la géométrie de l'élément",
    },
  },
  CoverageStyle: {
    comment: "not used?",
    field: "CoverageStyle",
    labels: {
      en: "style",
      fr: "Style",
    },
    tips: {
      en: "the preferred style of the item when rendered (e.g. point, line, polygon, image, star, circle, etc.)",
      fr: "Le style préféré de l'élément lorsqu'il est rendu (par exemple, point, ligne, polygone, image, étoile, cercle, etc.)",
    },
  },
  CoverageTiles: {
    comment: "not used?",
    field: "CoverageTiles",
    labels: {
      en: "folder of tiles",
      fr: "Dossier de tuiles",
    },
    tips: {
      en: "path to a folder of tiles in 'z/x/y.png' format when this item is used as a background plan",
      fr: "Chemin d'accès vers un dossier de tuiles au format 'z/x/y.png' lorsque cet élément est utilisé comme plan de fond",
    },
  },
  CoverageUnion: {
    comment: "not used?",
    field: "CoverageUnion",
    labels: {
      en: "union of spatial data",
      fr: "Union des données spatiales",
    },
    tips: {
      en: "the 2d union of all spatial data in WKT format",
      fr: "L'union 2D de toutes les données spatiales au format WKT",
    },
  },
  CoverageCoordinates: {
    comment: "not used?",
    field: "CoverageCoordinates",
    labels: {
      en: "spatial data",
      fr: "Données spatiales",
    },
    tips: {
      en: "raw spatial data of the item as a list of 'x,y,z;...' point/line/polygon shapes",
      fr: "Données spatiales brutes de l'élément sous forme de liste de formes de points/lignes/polygones 'x,y,z;...'",
    },
  },
  CoverageSpatialUUID: {
    comment: "not used?",
    field: "CoverageSpatialUUID",
    labels: {
      en: "Spatial UUID",
      fr: "UUID spatial",
    },
    tips: {
      en: "Unique identifier for the spatial coverage",
      fr: "Identifiant unique pour la couverture spatiale",
    },
  },
  CoverageSpatial: {
    comment: "not used?",
    field: "CoverageSpatial",
    type: "ExtraFields",
    labels: {
      en: "location",
      fr: "Emplacement",
    },
    tips: {
      en: "a human readable location for the item",
      fr: "Un emplacement lisible par l'homme pour l'élément",
    },
  },
  CoverageCRS: {
    comment: "not used?",
    field: "CoverageCRS",
    type: "ExtraFields",
    labels: {
      en: "CRS",
      fr: "CRS",
    },
    tips: {
      en: "the CRS defined above",
      fr: "Le CRS défini ci-dessus",
    },
  },
  CoverageGeometry: {
    comment: "not used?",
    field: "CoverageGeometry",
    type: "ExtraFields",
    labels: {
      en: "spatial data (3D)",
      fr: "Données spatiales (3D)",
    },
    tips: {
      en: "the 3d spatial data of the item as a WKT geometry collection",
      fr: "Les données spatiales 3D de l'élément sous forme de collection de géométries WKT",
    },
  },
  CoverageTransform: {
    comment: "not used?",
    field: "CoverageTransform",
    type: "ExtraFields",
    labels: {
      en: "transform",
      fr: "Transformation",
    },
    tips: {
      en: "the transform (world file) for this item's image when used as a background plan",
      fr: "La transformation (fichier mondial) pour l'image de cet élément lorsqu'elle est utilisée comme plan de fond",
    },
  },

  // COVERAGE SPATIAL find in items
  // OLD version fields
  SpatialCoordinates: {
    field: "SpatialCoordinates",
    labels: {
      en: "Spatial Coordinates",
      fr: "Coordonnées spatiales",
    },
    tips: {
      en: "coordinates of the spatial data",
      fr: "coordonnées des données spatiales",
    },
  },
  SpatialData: {
    field: "SpatialData",
    labels: {
      en: "Spatial Data",
      fr: "Données spatiales",
    },
    tips: {
      en: "raw spatial data",
      fr: "données spatiales brutes",
    },
  },
  SpatialEnvelope: {
    field: "SpatialEnvelope",
    labels: {
      en: "Spatial Envelope",
      fr: "Enveloppe spatiale",
    },
    tips: {
      en: "bounding box of the spatial data",
      fr: "boîte englobante des données spatiales",
    },
  },
  SpatialGeometry: {
    field: "SpatialGeometry",
    labels: {
      en: "Spatial Geometry",
      fr: "Géométrie spatiale",
    },
    tips: {
      en: "geometric representation of the spatial data",
      fr: "représentation géométrique des données spatiales",
    },
  },
  SpatialPosition: {
    field: "SpatialPosition",
    labels: {
      en: "Spatial Position",
      fr: "Position spatiale",
    },
    tips: {
      en: "position of the spatial data",
      fr: "position des données spatiales",
    },
  },
  SpatialStyle: {
    field: "SpatialStyle",
    labels: {
      en: "Spatial Style",
      fr: "Style spatial",
    },
    tips: {
      en: "styling information for the spatial data",
      fr: "informations de style pour les données spatiales",
    },
  },
  SpatialUnion: {
    field: "SpatialUnion",
    labels: {
      en: "Spatial Union",
      fr: "Union spatiale",
    },
    tips: {
      en: "union of multiple spatial data",
      fr: "union de plusieurs données spatiales",
    },
  },
  SpatialCRS: {
    field: "SpatialUnion",
    labels: {
      en: "CRS",
      fr: "CRS",
    },
    tips: {
      en: "the CRS defined above",
      fr: "Le CRS défini ci-dessus",
    },
  },
  SpatialAltitude: {
    field: "SpatialAltitude",
    labels: {
      en: "Altitude",
      fr: "Altitude",
    },
    tips: {
      en: "altitude of the spatial data",
      fr: "altitude des données spatiales",
    },
  },
  SpatialArea: {
    field: "SpatialArea",
    labels: {
      en: "Spatial Area",
      fr: "Superficie",
    },
    tips: {
      en: "area of the spatial data",
      fr: "superficie des données spatiales",
    },
  },
};
