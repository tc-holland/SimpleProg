import { useDrag } from 'react-dnd';

export function DraggableWord({ word }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'word',
    item: { word },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`px-4 py-2 bg-indigo-500 text-white rounded-lg cursor-move select-none transition-all hover:bg-indigo-600 hover:shadow-md ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      }`}
    >
      {word}
    </div>
  );
}
