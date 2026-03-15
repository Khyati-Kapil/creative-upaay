export function Layout(props: {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
}) {
  return (
    <div className="outer">
      <div className={"appShell" + (props.sidebarCollapsed ? " appShell--collapsed" : "")}>
        <aside className="sidebar">{props.sidebar}</aside>
        <div className="content">
          <header className="topbar">{props.topbar}</header>
          <div className="page">{props.children}</div>
        </div>
      </div>
    </div>
  );
}
