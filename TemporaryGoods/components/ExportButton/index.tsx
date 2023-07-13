import * as React from "react";
import "./styles.scss";

const { memo, forwardRef } = React;

const ExportButton = memo(
  forwardRef((props: any, ref) => {
    return (
      <div className="export-button" onClick={props.onExport}>
        <img
          style={{ width: "30px" }}
          src={require("assets/images/icon_export.png")}
        />
        <span>导出</span>
      </div>
    );
  })
);

export default ExportButton;
