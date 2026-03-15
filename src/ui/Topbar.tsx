import { BellIcon, CalendarIcon } from "./Icons";

export function Topbar(props: {
  search: string;
  onSearchChange: (value: string) => void;
  onCalendar: () => void;
  onHelp: () => void;
  onNotifications: () => void;
}) {
  return (
    <div className="topbarInner">
      <div className="search">
        <span className="searchIcon" aria-hidden="true" />
        <input
          className="searchInput"
          placeholder="Search for anything..."
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
        />
      </div>

      <div className="topbarRight">
        <button className="iconBtn" type="button" aria-label="Calendar" onClick={props.onCalendar}>
          <CalendarIcon />
        </button>
        <button className="iconBtn" type="button" aria-label="Help" onClick={props.onHelp}>
          <span aria-hidden="true" style={{ fontWeight: 900 }}>
            ?
          </span>
        </button>
        <button className="iconBtn" type="button" aria-label="Notifications" onClick={props.onNotifications}>
          <BellIcon />
        </button>

        <div className="user">
          <div className="userText">
            <div className="userName">User Name</div>
            <div className="userLoc">Rajasthan, India</div>
          </div>
          <div className="avatar" aria-hidden="true" />
          <span className="chev" aria-hidden="true">
            ▾
          </span>
        </div>
      </div>
    </div>
  );
}
