const deepClone = object => {
  const clone = Object.assign({}, object);

  Object.keys(clone).forEach(
    key =>
      (clone[key] =
        typeof object[key] === 'object' ? deepClone(object[key]) : object[key]),
  );

  if (Array.isArray(object) && object.length) {
    clone.length = object.length;
    return [].slice.call(clone);
  }

  return Array.isArray(object) ? [].slice.call(object) : clone;
};

const mapDisplayItems = (items, itemsToMapWith) => {
  const refItems = deepClone(items);
  const refItemsToMapWith = deepClone(itemsToMapWith);
  const target = [];

  refItems.forEach(item => {
    refItemsToMapWith.forEach(itemToMapWith => {
      if (item.custom.name === itemToMapWith.name) {
        target.push({
          id: itemToMapWith.id,
          sku: itemToMapWith.sku,
          slug: itemToMapWith.slug,
          name: itemToMapWith.name,
          amount: item.amout,
          currency: item.currency,
          quantity: item.quantity,
        });
      }
    });
  });

  return target;
};

module.exports = {
  deepClone,
  mapDisplayItems,
};
