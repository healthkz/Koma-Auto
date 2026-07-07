const pkg = require('zustand/vanilla');
const createStore = pkg.createStore;

const store = createStore((set) => ({
  items: [],
  addItem: (item) => set(state => ({ items: [...state.items, item] })),
  removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) }))
}));

store.subscribe((state, prevState) => {
  console.log("Subscriber called!");
  console.log("State items:", state.items.length);
  console.log("Prev items:", prevState?.items?.length);
  console.log("Items changed?", state.items !== prevState?.items);
});

store.getState().addItem({ id: 1 });
store.getState().removeItem(1);
