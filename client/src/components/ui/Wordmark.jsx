/** "PingAtlas" with the second half in the brand gradient. */
export function Wordmark({ className = 'text-lg' }) {
  return (
    <span aria-hidden="true" className={`font-semibold tracking-tight text-white ${className}`}>
      Ping
      <span className="bg-gradient-to-br from-sky-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Atlas
      </span>
    </span>
  );
}
