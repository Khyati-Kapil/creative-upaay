type DotColor = "green" | "orange" | "purple" | "blue";

function NavItem(p: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button className={"navItem" + (p.active ? " navItem--active" : "")} type="button" onClick={p.onClick}>
      <span className="navIcon" aria-hidden="true" />
      <span>{p.label}</span>
    </button>
  );
}

function ProjectRow(p: { label: string; color: DotColor; active?: boolean; onClick: () => void }) {
  return (
    <button className={"projectRow" + (p.active ? " projectRow--active" : "")} type="button" onClick={p.onClick}>
      <span className={"dot dot--" + p.color} aria-hidden="true" />
      <span className="projectLabel">{p.label}</span>
      <span className="kebab" aria-hidden="true">
        ⋯
      </span>
    </button>
  );
}

export function Sidebar(props: {
  activeNav: string;
  onNavSelect: (label: string) => void;
  activeProject: string;
  onProjectSelect: (label: string) => void;
  onToggleCollapse: () => void;
}) {
  return (
    <div className="sidebarInner">
      <div className="brand">
        <span className="brandMark" aria-hidden="true" />
        <span className="brandName">Project M.</span>
        <button className="ghostBtn brandCollapse" type="button" onClick={props.onToggleCollapse} aria-label="Collapse">
          <span aria-hidden="true">≪</span>
        </button>
      </div>

      <div className="nav">
        {["Home", "Messages", "Tasks", "Members", "Settings"].map((label) => (
          <NavItem
            key={label}
            label={label}
            active={props.activeNav === label}
            onClick={() => props.onNavSelect(label)}
          />
        ))}
      </div>

      <div className="divider" />

      <div className="projectsHead">
        <span className="mutedCaps">MY PROJECTS</span>
        <button className="iconBtn" type="button" aria-label="Add project">
          +
        </button>
      </div>

      <div className="projects">
        <ProjectRow
          label="Mobile App"
          color="green"
          active={props.activeProject === "Mobile App"}
          onClick={() => props.onProjectSelect("Mobile App")}
        />
        <ProjectRow
          label="Website Redesign"
          color="orange"
          active={props.activeProject === "Website Redesign"}
          onClick={() => props.onProjectSelect("Website Redesign")}
        />
        <ProjectRow
          label="Design System"
          color="purple"
          active={props.activeProject === "Design System"}
          onClick={() => props.onProjectSelect("Design System")}
        />
        <ProjectRow
          label="Wireframes"
          color="blue"
          active={props.activeProject === "Wireframes"}
          onClick={() => props.onProjectSelect("Wireframes")}
        />
      </div>

      <div className="thoughts panel">
        <div className="bulb" aria-hidden="true" />
        <div className="thoughtsTitle">Thoughts Time</div>
        <div className="thoughtsText">
          We don’t have any notice for you, till then you can share your thoughts with your peers.
        </div>
        <button className="primaryBtn" type="button">
          Write a message
        </button>
      </div>
    </div>
  );
}
