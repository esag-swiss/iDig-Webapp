import "leaflet.control.layers.tree";

L.Control.Layers.Tree.include({
  unselectAll: function () {
    const checkboxes = this._container.querySelectorAll(
      'input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event("change"));
      }
    });
  },
  removeAllOverlays: function (map) {
    function removeLayersFromTree(tree) {
      if (tree.children) {
        tree.children.forEach((child) => {
          if (child.layer && map.hasLayer(child.layer)) {
            map.removeLayer(child.layer);
          }
          removeLayersFromTree(child);
        });
      }
    }
    removeLayersFromTree(this._overlaysTree);
  },
});

export default L.Control.Layers.Tree;
