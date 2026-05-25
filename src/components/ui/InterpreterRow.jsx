import InterpreterBubble from "./InterpreterBubble";

export default function InterpreterRow({ interpreters }) {
  if (!interpreters || !interpreters.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {interpreters.map((item, i) => (
        <InterpreterBubble key={i} name={item.name} language={item.language} isHost={item.isHost} />
      ))}
    </div>
  );
}
