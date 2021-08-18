### Available Hooks

| Hook Name | Description |
| --------- | ----------- |
| head-start | Fired after "the first three prioritized tags" right after `<head>` starts. The first three `head`er-tags in ALL HTML documents should always be `meta charset`, then `meta viewport`, then `title`. Right after these three this hook is fired. |
| head-end | Fired right before the closing `</head>` tag. If you MUST use javascript in your page head, then make sure to load it here instead of `head-start`. CSS should always be loaded before JavaScript to improve page speed. |
| body-start | Fired right after the opening `<body>` tag. |
| container-start | Fired at the beginning of the main container (below the top navigation, before the content). |
| content-start | Fired at the start inside the content column (if multi columns are used this is only as wide as the content column). |
| content-end | Fired at the end inside the content column (if multi columns are used this is only as wide as the content column). |
| sidebar-start | Fired at the start of the sidebar column. |
| sidebar-end | Fired at the end of the sidebar column. |
| container-end | Fired at the end of the main container, before the footer section begins. |
| body-end | Fired right after the closing `</body>` tag. |