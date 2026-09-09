export function RetroGrid({
  angle = 65,
  cellSize = 60,
  opacity = 0.3,
  lineColor = "gray",
}) {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--line-color": lineColor,
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]"
      style={{ ...gridStyles, opacity: opacity }}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className="animate-grid [background-repeat:repeat] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]"
          style={{
            backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 0), linear-gradient(to bottom, ${lineColor} 1px, transparent 0)`,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent to-90%" />
    </div>
  )
}