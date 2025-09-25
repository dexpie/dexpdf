export default function BaseTool({ title, description }) {
  return (
    <div className="tool-layout">
      <div className="tool-info">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="tool-content">
        <div className="tool-dropzone">
          <input
            type="file"
            accept=".pdf"
            id="file-input"
          />
          <label htmlFor="file-input">
            Drop PDF here or click to select
          </label>
        </div>
      </div>
    </div>
  )
}