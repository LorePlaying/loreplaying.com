(() => {
  const mapElement = document.getElementById("literary-map");
  if (!mapElement) return;

  const appElement = document.getElementById("lp-map-app");
  const mainElement = document.getElementById("lp-map-main");
  const sidebar = document.getElementById("lp-map-sidebar");
  const openSidebarButton = document.getElementById("lp-map-open-sidebar");
  const closeSidebarButton = document.getElementById("lp-map-close-sidebar");
  const catalogueView = document.getElementById("lp-map-catalogue-view");
  const workView = document.getElementById("lp-map-work-view");
  const workDetails = document.getElementById("lp-map-work-details");
  const workList = document.getElementById("lp-map-work-list");
  const searchInput = document.getElementById("lp-map-search");
  const clearSearchButton = document.getElementById("lp-map-clear-search");
  const periodFilter = document.getElementById("lp-map-period-filter");
  const resultCount = document.getElementById("lp-map-result-count");
  const noResults = document.getElementById("lp-map-no-results");
  const backButton = document.getElementById("lp-map-back-to-catalogue");
  const journeyPanel = document.getElementById("lp-map-journey-panel");
  const journeyPanelToggle = document.getElementById("lp-map-journey-toggle");
  const journeyPanelLock = document.getElementById("lp-map-journey-lock");
  const journeyPanelDragHandle = document.getElementById("lp-map-journey-drag-handle");
  const journeyPanelBody = document.getElementById("lp-map-journey-body");
  const journeyTitle = document.getElementById("lp-map-journey-title");
  const journeyCount = document.getElementById("lp-map-journey-count");
  const currentStopLabel = document.getElementById("lp-map-current-stop");
  const journeyStatus = document.getElementById("lp-map-journey-status");
  const previousStopButton = document.getElementById("lp-journey-previous");
  const nextStopButton = document.getElementById("lp-journey-next");
  const speedInput = document.getElementById("lp-journey-speed");
  const speedValue = document.getElementById("lp-journey-speed-value");
  const interactiveJourneyInput = document.getElementById("lp-journey-interactive");
  const mapControlsElement = document.getElementById("lp-map-controls");
  const dataElement = document.getElementById("literary-map-data");

  if (typeof window.L === "undefined") {
    mapElement.innerHTML =
      '<p class="lp-map-noscript">The map library could not be loaded. The catalogue and ordered stop lists remain available.</p>';
    return;
  }

  let data;
  try {
    data = JSON.parse(dataElement.textContent);
  } catch (error) {
    console.error("Could not read literary map data.", error);
    mapElement.innerHTML =
      '<p class="lp-map-noscript">The literary map data could not be loaded. Please try again later.</p>';
    return;
  }

  const works = Array.isArray(data.works) ? data.works : [];
  const places = Array.isArray(data.places) ? data.places : [];
  const journeys = Array.isArray(data.journeys) ? data.journeys : [];
  const worksById = new Map(works.map((work) => [work.id, work]));
  const placesById = new Map(places.map((place) => [place.id, place]));
  const journeysByWorkId = new Map(
    journeys.map((journey) => [journey.work, journey]),
  );
  const markersByPlaceId = new Map();
  const markerVisitsByPlaceId = new Map();
  let activePlacePopup = null;
  let focusedPlaceId = null;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const normalize = (value) =>
    String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  const escapeHTML = (value) =>
    String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  const safeLink = (value) => {
    const url = String(value || "");
    return /^https:\/\//i.test(url) || /^\/(?!\/)/.test(url) ? url : "";
  };
  const creatorOf = (work) => work.author || "Author not listed";
  const coordinatesOf = (place) => [
    Number(place.coordinates.lat),
    Number(place.coordinates.lon),
  ];
  const closeActivePlacePopup = () => {
    markersByPlaceId.forEach((marker) => marker.closePopup());
    activePlacePopup = null;
  };
  const openPlacePopup = (marker) => {
    markersByPlaceId.forEach((otherMarker) => {
      if (otherMarker === marker) return;
      otherMarker.closePopup();
      otherMarker.setZIndexOffset(0);
    });
    marker.setZIndexOffset(1000);
    activePlacePopup = marker;
    marker.openPopup();
  };
  const journeyModeInfo = (mode) => {
    const modes = {
      boat: { icon: "🚣", label: "By boat" },
      ferry: { icon: "⛴️", label: "By ferry" },
      horseback: { icon: "🐎", label: "On horseback" },
      land: { icon: "🚶", label: "By land" },
      march: { icon: "🚶", label: "Marching on foot" },
      overland: { icon: "🛣️", label: "Overland" },
      raft: { icon: "🛶", label: "By raft" },
      river: { icon: "🛶", label: "By river" },
      road: { icon: "🛣️", label: "By road" },
      rowboat: { icon: "🚣", label: "By rowing boat" },
      sea: { icon: "🚢", label: "By sea" },
      ship: { icon: "🚢", label: "By ship" },
      walk: { icon: "🚶", label: "On foot" },
    };
    return modes[mode] || { icon: "🧭", label: "Mode not specified" };
  };

  const streetTileStyle = {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, &copy; OpenStreetMap contributors, and the GIS User Community",
    options: { maxZoom: 19 },
  };
  const tileStyles = {
    street: streetTileStyle,
    dark: streetTileStyle,
    topo: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, <a href="https://opentopomap.org/" target="_blank" rel="noopener noreferrer">OpenTopoMap</a> (CC-BY-SA)',
      options: {
        maxNativeZoom: 17,
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      },
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution:
        "Tiles &copy; Esri, Vantor, Earthstar Geographics, and the GIS User Community",
      options: { maxZoom: 19 },
    },
  };

  const map = window.L.map(mapElement, {
    attributionControl: true,
    closePopupOnClick: true,
    fadeAnimation: false,
    zoomControl: false,
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 19,
    scrollWheelZoom: true,
    preferCanvas: true,
  }).setView([32, 12], 2);
  map.attributionControl.setPrefix(false);
  map.attributionControl.setPosition("topright");
  map.attributionControl
    .getContainer()
    .setAttribute(
      "aria-label",
      "Map credits; hover or focus to view full provider attributions",
    );
  map.attributionControl.getContainer().setAttribute("role", "group");
  map.attributionControl.getContainer().setAttribute("tabindex", "0");

  let mapResizeTimeout = null;
  const scheduleMapSizeUpdate = () => {
    window.clearTimeout(mapResizeTimeout);
    mapResizeTimeout = window.setTimeout(() => {
      mapResizeTimeout = null;
      map.invalidateSize({ pan: false });
    }, 250);
  };
  if (typeof window.ResizeObserver === "function") {
    new window.ResizeObserver(scheduleMapSizeUpdate).observe(mapElement);
  }

  const zoomControl = window.L.control.zoom({ position: "bottomright" }).addTo(map);
  window.L.control
    .scale({ position: "bottomleft", imperial: false, metric: true })
    .addTo(map);
  mapControlsElement.classList.add("leaflet-control");
  const mapStyleControl = window.L.control({ position: "bottomright" });
  mapStyleControl.onAdd = () => mapControlsElement;
  mapStyleControl.addTo(map);
  const bottomRightControls = mapElement.querySelector(
    ".leaflet-bottom.leaflet-right",
  );
  bottomRightControls.insertBefore(
    zoomControl.getContainer(),
    mapControlsElement,
  );

  let activeTileLayer = null;
  let selectedWork = null;
  let routeLines = [];
  let routeModeMarkers = [];
  let movingMarker = null;
  let animationFrame = null;
  let journeyRoute = null;
  let journeyProgress = 0;
  let lastAnimationTime = 0;
  let currentStops = [];
  let currentStopIndex = -1;
  let journeySpeed = Number(speedInput.value);
  let selectedStopIndex = -1;
  let currentStyle = "street";

  const setJourneyStatus = (message) => {
    if (journeyStatus) journeyStatus.textContent = message;
  };

  const setMapStyle = (styleName) => {
    const style = tileStyles[styleName];
    if (!style || (styleName === currentStyle && activeTileLayer)) return;
    if (activeTileLayer) map.removeLayer(activeTileLayer);
    activeTileLayer = window.L.tileLayer(style.url, {
      ...style.options,
      attribution: style.attribution,
      keepBuffer: 1,
    }).addTo(map);
    currentStyle = styleName;
    appElement.dataset.mapStyle = styleName;
    document.querySelectorAll("[data-map-style-button]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.mapStyleButton === styleName),
      );
    });
    const clearStyleError = () => {
      if (currentStyle === styleName && !selectedWork) setJourneyStatus("");
    };

    activeTileLayer.on("tileerror", () => {
      if (currentStyle !== styleName) return;
      setJourneyStatus(
        `${styleName.toUpperCase()} map tiles could not be loaded. Check your connection or choose another map style.`,
      );
    });
    activeTileLayer.once("load", clearStyleError);
  };

  document.querySelectorAll("[data-map-style-button]").forEach((button) => {
    button.addEventListener("click", () => {
      if (activePlacePopup) closeActivePlacePopup();
      setMapStyle(button.dataset.mapStyleButton);
    });
  });
  setMapStyle("street");

  const showSidebar = (show) => {
    appElement.classList.toggle("is-sidebar-collapsed", !show);
    openSidebarButton.setAttribute("aria-expanded", String(show));
    closeSidebarButton.setAttribute("aria-expanded", String(show));
    if (sidebar) sidebar.setAttribute("aria-hidden", String(!show));
    if (show) {
      closeSidebarButton.focus();
    } else {
      openSidebarButton.focus();
    }
    scheduleMapSizeUpdate();
  };

  openSidebarButton.addEventListener("click", () => showSidebar(true));
  closeSidebarButton.addEventListener("click", () => showSidebar(false));

  const placeMatchesStop = (place, stop) => {
    const stopKey = normalize(stop);
    return [place.name, ...(place.aliases || [])].some(
      (name) => normalize(name) === stopKey,
    );
  };

  const getWorkStops = (work) => {
    const sequence = Array.isArray(work.stops) ? work.stops : [];
    const details = Array.isArray(work.stopDetails) ? work.stopDetails : [];
    return sequence.map((name, index) => {
      const place = places.find(
        (candidate) =>
          candidate.works.includes(work.id) &&
          placeMatchesStop(candidate, name),
      );
      return {
        name,
        detail: String(details[index] || ""),
        index,
        place: place || null,
      };
    });
  };

  const getStopsForPlace = (work, place) =>
    getWorkStops(work)
      .filter((stop) => stop.place && stop.place.id === place.id)
      .map((stop) => stop.index + 1);

  const markerIcon = (visitNumbers = [], delay = 0, active = false) => {
    const label = visitNumbers.length ? visitNumbers.join("·") : "•";
    const activeClass = active ? " is-current" : "";
    const width = Math.max(32, Math.ceil(label.length * 5.5 + 12));
    return window.L.divIcon({
      className: "lp-map-stop-marker-wrapper",
      html: `<span class="lp-map-stop-marker${activeClass}" style="--marker-delay:${delay}ms" aria-hidden="true">${escapeHTML(label)}</span>`,
      iconSize: [width, 32],
      iconAnchor: [width / 2, 16],
      popupAnchor: [0, -14],
    });
  };

  const stopSequenceForPlace = (work, place) => {
    const numbers = getStopsForPlace(work, place);
    if (numbers.length === 0) return "";
    const suffix = numbers.length > 1 ? "Stops" : "Stop";
    return `<p class="lp-map-popup-number">${suffix} ${numbers.join(", ")}</p>`;
  };

  const popupContentForPlace = (place) => {
    const work = selectedWork;
    const sequence = work ? stopSequenceForPlace(work, place) : "";
    const matchingStops = work
      ? getWorkStops(work).filter(
          (stop) => stop.place && stop.place.id === place.id,
        )
      : [];
    const activeStop =
      matchingStops.find((stop) => stop.index === selectedStopIndex) ||
      matchingStops[0];
    const stopDetail = activeStop && activeStop.detail
      ? `<p class="lp-map-popup-stop-detail">${escapeHTML(activeStop.detail)}</p>`
      : "";
    const note = place.locationNote
      ? `<p><strong>Location:</strong> ${escapeHTML(place.locationNote)}</p>`
      : "";
    const relatedWorks = (place.works || [])
      .map((id) => worksById.get(id))
      .filter(Boolean)
      .map((relatedWork) => escapeHTML(relatedWork.title))
      .join(", ");
    const description = place.description
      ? `<p>${escapeHTML(place.description)}</p>`
      : "";
    const worksText = !work && relatedWorks
      ? `<p><strong>Works:</strong> ${relatedWorks}</p>`
      : "";
    return `<div class="lp-map-popup">${sequence}<h3>${escapeHTML(place.name)}</h3><p>${escapeHTML(place.country || "")}</p>${stopDetail}${description}${note}${worksText}</div>`;
  };

  const updateMarkers = () => {
    const visiblePlaceIds = new Set();
    const visitsByPlaceId = new Map();

    if (selectedWork) {
      getWorkStops(selectedWork).forEach((stop) => {
        if (!stop.place) return;
        visiblePlaceIds.add(stop.place.id);
        const visits = visitsByPlaceId.get(stop.place.id) || [];
        visits.push(stop.index + 1);
        visitsByPlaceId.set(stop.place.id, visits);
      });
    } else if (focusedPlaceId) {
      visiblePlaceIds.add(focusedPlaceId);
    }

    places.forEach((place, index) => {
      const marker = markersByPlaceId.get(place.id);
      if (!marker) return;
      const visible = visiblePlaceIds.has(place.id);
      if (visible && !map.hasLayer(marker)) marker.addTo(map);
      if (!visible && map.hasLayer(marker)) map.removeLayer(marker);
      const visits = visitsByPlaceId.get(place.id) || [];
      marker.setIcon(
        markerIcon(
          visits,
          reducedMotion ? 0 : (index % 12) * 35,
          selectedWork && visits.includes(selectedStopIndex + 1),
        ),
      );
      marker.setPopupContent(popupContentForPlace(place));
      markerVisitsByPlaceId.set(place.id, visits);
    });
  };

  places.forEach((place, index) => {
    if (
      !place.coordinates ||
      !Number.isFinite(Number(place.coordinates.lat)) ||
      !Number.isFinite(Number(place.coordinates.lon))
    ) {
      return;
    }
    const marker = window.L.marker(coordinatesOf(place), {
      icon: markerIcon([], reducedMotion ? 0 : (index % 12) * 35),
      title: place.name,
      alt: place.name,
      riseOnHover: true,
    });
    marker.bindPopup(popupContentForPlace(place), {
      maxWidth: 280,
      autoPan: true,
      keepInView: true,
    });
    marker.on("click", () => {
      if (!selectedWork) return;
      const numbers = getStopsForPlace(selectedWork, place);
      selectedStopIndex = numbers.length ? numbers[0] - 1 : -1;
      currentStopIndex = selectedStopIndex;
      updateCurrentStopLabel();
      updateMarkers();
      map.setView(coordinatesOf(place), Math.max(map.getZoom(), 6), {
        animate: !reducedMotion,
      });
      openPlacePopup(marker);
    });
    marker.on("popupclose", () => {
      if (activePlacePopup !== marker) return;
      activePlacePopup = null;
      marker.setZIndexOffset(0);
    });
    markersByPlaceId.set(place.id, marker);
  });

  const routeModeIcon = (info) =>
    window.L.divIcon({
      className: "lp-map-route-mode-wrapper",
      html: `<span class="lp-map-route-mode" title="${escapeHTML(info.label)}" aria-label="${escapeHTML(info.label)}">${info.icon}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

  const routePointsForLeg = (work, index, start, end) => {
    const journey = journeysByWorkId.get(work.id);
    const legs = journey && Array.isArray(journey.legs) ? journey.legs : [];
    const sourcePoints = legs[index];
    if (!Array.isArray(sourcePoints) || sourcePoints.length < 2) {
      return [start, end];
    }
    const points = sourcePoints.map((point) => [
      Number(point[1]),
      Number(point[0]),
    ]);
    points[0] = start;
    points[points.length - 1] = end;
    return points;
  };

  const drawWorkRoute = (work) => {
    const stops = getWorkStops(work);
    stops.slice(0, -1).forEach((stop, index) => {
      const nextStop = stops[index + 1];
      if (
        !stop.place ||
        !stop.place.coordinates ||
        !nextStop.place ||
        !nextStop.place.coordinates
      ) {
        return;
      }

      const start = coordinatesOf(stop.place);
      const end = coordinatesOf(nextStop.place);
      const path = routePointsForLeg(work, index, start, end);
      const hasMovement = path.some(
        (point, pointIndex) =>
          pointIndex > 0 &&
          (point[0] !== path[pointIndex - 1][0] ||
            point[1] !== path[pointIndex - 1][1]),
      );
      if (!hasMovement) return;

      const mode = (work.journeyModes || [])[index];
      const info = journeyModeInfo(mode);
      const isSea = [
        "boat",
        "ferry",
        "raft",
        "river",
        "rowboat",
        "sea",
        "ship",
      ].includes(mode);
      const color = isSea ? "#286980" : mode ? "#806036" : "#b84f31";
      const line = window.L.polyline(path, {
        color,
        weight: 3,
        opacity: 0.78,
        dashArray: "8 7",
        interactive: false,
      }).addTo(map);
      routeLines.push(line);

      const midpoint = path[Math.floor(path.length / 2)];
      const marker = window.L.marker(midpoint, {
        icon: routeModeIcon(info),
        title: `${stop.name} to ${nextStop.name}: ${info.label}`,
        alt: `${info.label} between stops ${stop.index + 1} and ${nextStop.index + 1}`,
        interactive: false,
        keyboard: false,
        zIndexOffset: 200,
      }).addTo(map);
      routeModeMarkers.push(marker);
    });
  };

  const movingMarkerIcon = window.L.divIcon({
    className: "lp-map-moving-marker-wrapper",
    html: '<span class="lp-map-stop-marker is-current" aria-hidden="true"><svg class="lp-map-loop-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m15.7 8.3-2.2 5.2-5.2 2.2 2.2-5.2z"></path><circle cx="12" cy="12" r="1"></circle></svg></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const buildJourneyRoute = (work) => {
    const stops = getWorkStops(work);
    if (
      stops.length < 2 ||
      stops.some(
        (stop) => !stop.place || !stop.place.coordinates,
      )
    ) {
      return null;
    }

    const points = [];
    stops.slice(0, -1).forEach((stop, index) => {
      const nextStop = stops[index + 1];
      const start = coordinatesOf(stop.place);
      const end = coordinatesOf(nextStop.place);
      routePointsForLeg(work, index, start, end).forEach((point) => {
        const previous = points[points.length - 1];
        if (
          !previous ||
          previous[0] !== point[0] ||
          previous[1] !== point[1]
        ) {
          points.push(point);
        }
      });
    });
    if (points.length < 2) return null;

    const segmentLengths = points.slice(0, -1).map((point, index) =>
      window.L.latLng(point).distanceTo(window.L.latLng(points[index + 1])),
    );
    const totalDistance = segmentLengths.reduce(
      (total, length) => total + length,
      0,
    );
    return totalDistance > 0
      ? { points, segmentLengths, totalDistance }
      : null;
  };

  const pointAtProgress = (route, progress) => {
    let remaining = route.totalDistance * progress;
    for (let index = 0; index < route.segmentLengths.length; index += 1) {
      const segmentLength = route.segmentLengths[index];
      if (remaining <= segmentLength) {
        const ratio = segmentLength ? remaining / segmentLength : 0;
        const start = route.points[index];
        const end = route.points[index + 1];
        return [
          start[0] + (end[0] - start[0]) * ratio,
          start[1] + (end[1] - start[1]) * ratio,
        ];
      }
      remaining -= segmentLength;
    }
    return route.points[route.points.length - 1];
  };

  const stopInteractiveJourney = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    lastAnimationTime = 0;
    if (movingMarker) map.removeLayer(movingMarker);
    movingMarker = null;
    journeyProgress = 0;
  };

  const clearJourney = () => {
    closeActivePlacePopup();
    stopInteractiveJourney();
    routeLines.forEach((line) => map.removeLayer(line));
    routeModeMarkers.forEach((marker) => map.removeLayer(marker));
    routeLines = [];
    routeModeMarkers = [];
    journeyRoute = null;
    currentStops = [];
    currentStopIndex = -1;
    selectedStopIndex = -1;
    journeyTitle.textContent = selectedWork
      ? selectedWork.title
      : "Choose a work to explore its journey";
    journeyCount.textContent = "0 stops · 0 legs";
    currentStopLabel.textContent = "No work selected";
    previousStopButton.disabled = true;
    nextStopButton.disabled = true;
    speedInput.disabled = true;
    interactiveJourneyInput.checked = false;
    interactiveJourneyInput.disabled = true;
    setJourneyStatus("Select a title to see its stops.");
  };

  const updateCurrentStopLabel = () => {
    const stop = currentStops[currentStopIndex];
    currentStopLabel.textContent = stop
      ? `Stop ${currentStopIndex + 1} of ${currentStops.length}: ${stop.name}`
      : "No stops listed";
  };

  const configureJourney = (work) => {
    currentStops = getWorkStops(work);
    currentStopIndex = currentStops.length ? 0 : -1;
    journeyRoute = buildJourneyRoute(work);
    journeyTitle.textContent = work.title;
    journeyCount.textContent = `${currentStops.length} stops · ${Math.max(0, currentStops.length - 1)} legs`;
    previousStopButton.disabled = currentStops.length < 2;
    nextStopButton.disabled = currentStops.length < 2;
    interactiveJourneyInput.checked = false;
    const canLoop = Boolean(journeyRoute && !reducedMotion);
    interactiveJourneyInput.disabled = !canLoop;
    speedInput.disabled = !canLoop;
    drawWorkRoute(work);
    updateCurrentStopLabel();

    const journey = journeysByWorkId.get(work.id);
    if (!currentStops.length) {
      setJourneyStatus("No narrative stops are listed for this title.");
    } else if (reducedMotion && journeyRoute) {
      setJourneyStatus(
        "Continuous motion is disabled by your reduced-motion setting. Use Previous and Next to explore stops.",
      );
    } else if (!journeyRoute) {
      setJourneyStatus(
        "Continuous looping is unavailable because some stops are text-only. Use Previous and Next to explore the route.",
      );
    } else {
      setJourneyStatus(
        journey && journey.description
          ? journey.description
          : "The marker follows the schematic route continuously; exact road and sea tracks are not claimed.",
      );
    }
  };

  const showJourneyStop = (index, moveMap = true) => {
    const stop = currentStops[index];
    if (!stop) return;
    const detailNote = stop.detail ? ` ${stop.detail}` : "";
    currentStopIndex = index;
    selectedStopIndex = stop.index;
    updateCurrentStopLabel();
    updateMarkers();

    if (!stop.place || !stop.place.coordinates) {
      closeActivePlacePopup();
      const suffix = interactiveJourneyInput.checked
        ? " The continuous marker loop is unaffected."
        : "";
      setJourneyStatus(
        `Stop ${index + 1} is text-only because its location is not reliably mapped.${detailNote}${suffix}`,
      );
      return;
    }

    const marker = markersByPlaceId.get(stop.place.id);
    if (moveMap) {
      map.setView(coordinatesOf(stop.place), Math.max(map.getZoom(), 6), {
        animate: !reducedMotion,
      });
    }
    if (marker) openPlacePopup(marker);
    const loopNote = interactiveJourneyInput.checked
      ? " The marker loop continues; this pop-up will stay open."
      : "";
    setJourneyStatus(
      `Stop ${index + 1} of ${currentStops.length}: ${stop.name}.${detailNote}${loopNote}`,
    );
  };

  const startInteractiveJourney = () => {
    if (!journeyRoute || reducedMotion) return;
    movingMarker = window.L.marker(journeyRoute.points[0], {
      icon: movingMarkerIcon,
      title: `${selectedWork.title} continuous journey marker`,
      alt: `Continuous route marker for ${selectedWork.title}`,
      interactive: false,
      keyboard: false,
      zIndexOffset: 300,
    }).addTo(map);
    lastAnimationTime = 0;
    const animate = (now) => {
      if (!interactiveJourneyInput.checked || !movingMarker) {
        animationFrame = null;
        return;
      }
      if (lastAnimationTime) {
        journeyProgress =
          (journeyProgress +
            ((now - lastAnimationTime) * journeySpeed) / 30000) %
          1;
      }
      lastAnimationTime = now;
      movingMarker.setLatLng(pointAtProgress(journeyRoute, journeyProgress));
      animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
  };

  previousStopButton.addEventListener("click", () => {
    if (currentStops.length < 2) return;
    const previousIndex =
      (currentStopIndex - 1 + currentStops.length) % currentStops.length;
    showJourneyStop(previousIndex);
  });
  nextStopButton.addEventListener("click", () => {
    if (currentStops.length < 2) return;
    showJourneyStop((currentStopIndex + 1) % currentStops.length);
  });

  speedInput.addEventListener("input", () => {
    journeySpeed = Number(speedInput.value);
    const value = `${journeySpeed.toFixed(2)}×`;
    speedValue.value = value;
    speedValue.textContent = value;
  });

  interactiveJourneyInput.addEventListener("change", () => {
    if (interactiveJourneyInput.checked) {
      if (!journeyRoute || reducedMotion) {
        interactiveJourneyInput.checked = false;
        return;
      }
      journeyProgress = 0;
      startInteractiveJourney();
      setJourneyStatus(
        `Marker loops continuously at ${journeySpeed.toFixed(2)}× speed. Stop pop-ups remain open.`,
      );
      return;
    }
    stopInteractiveJourney();
    setJourneyStatus("Continuous marker loop stopped.");
  });

  journeyPanelToggle.addEventListener("click", () => {
    const expanded = journeyPanelToggle.getAttribute("aria-expanded") === "true";
    journeyPanelToggle.setAttribute("aria-expanded", String(!expanded));
    journeyPanelBody.hidden = expanded;
  });

  let journeyPanelLocked = true;
  let journeyPanelDrag = null;
  const setJourneyPanelPosition = (left, top) => {
    const mainBounds = mainElement.getBoundingClientRect();
    const panelBounds = journeyPanel.getBoundingClientRect();
    const maxLeft = Math.max(8, mainBounds.width - panelBounds.width - 8);
    const maxTop = Math.max(8, mainBounds.height - panelBounds.height - 8);
    journeyPanel.style.left = `${Math.max(8, Math.min(left, maxLeft))}px`;
    journeyPanel.style.top = `${Math.max(8, Math.min(top, maxTop))}px`;
    journeyPanel.style.right = "auto";
  };
  const setJourneyPanelLocked = (locked) => {
    journeyPanelLocked = locked;
    journeyPanelLock.setAttribute("aria-pressed", String(locked));
    journeyPanelLock.setAttribute(
      "aria-label",
      locked
        ? "Unlock the journey panel position"
        : "Lock the journey panel position",
    );
    journeyPanelLock.title = locked
      ? "Unlock the panel to move it"
      : "Lock the panel in place";
    journeyPanelDragHandle.setAttribute("aria-disabled", String(locked));
    journeyPanel.classList.toggle("is-position-locked", locked);
  };
  journeyPanelLock.addEventListener("click", () =>
    setJourneyPanelLocked(!journeyPanelLocked),
  );
  journeyPanelDragHandle.addEventListener("pointerdown", (event) => {
    if (journeyPanelLocked || event.button !== 0) return;
    const panelBounds = journeyPanel.getBoundingClientRect();
    journeyPanelDrag = {
      pointerId: event.pointerId,
      offsetX: event.clientX - panelBounds.left,
      offsetY: event.clientY - panelBounds.top,
    };
    journeyPanelDragHandle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  journeyPanelDragHandle.addEventListener("pointermove", (event) => {
    if (!journeyPanelDrag || journeyPanelDrag.pointerId !== event.pointerId) {
      return;
    }
    const mainBounds = mainElement.getBoundingClientRect();
    setJourneyPanelPosition(
      event.clientX - mainBounds.left - journeyPanelDrag.offsetX,
      event.clientY - mainBounds.top - journeyPanelDrag.offsetY,
    );
  });
  const endJourneyPanelDrag = (event) => {
    if (!journeyPanelDrag || journeyPanelDrag.pointerId !== event.pointerId) {
      return;
    }
    if (journeyPanelDragHandle.hasPointerCapture(event.pointerId)) {
      journeyPanelDragHandle.releasePointerCapture(event.pointerId);
    }
    journeyPanelDrag = null;
  };
  journeyPanelDragHandle.addEventListener("pointerup", endJourneyPanelDrag);
  journeyPanelDragHandle.addEventListener(
    "pointercancel",
    endJourneyPanelDrag,
  );
  journeyPanelDragHandle.addEventListener("keydown", (event) => {
    if (journeyPanelLocked) return;
    const offsets = {
      ArrowDown: [0, 16],
      ArrowLeft: [-16, 0],
      ArrowRight: [16, 0],
      ArrowUp: [0, -16],
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const mainBounds = mainElement.getBoundingClientRect();
    const panelBounds = journeyPanel.getBoundingClientRect();
    setJourneyPanelPosition(
      panelBounds.left - mainBounds.left + offset[0],
      panelBounds.top - mainBounds.top + offset[1],
    );
  });
  window.addEventListener("resize", () => {
    scheduleMapSizeUpdate();
    if (!journeyPanel.style.left) return;
    setJourneyPanelPosition(
      Number.parseFloat(journeyPanel.style.left),
      Number.parseFloat(journeyPanel.style.top),
    );
  });
  setJourneyPanelLocked(true);

  const workMatchesFilters = (work) => {
    const period = periodFilter.value;
    const query = normalize(searchInput.value);
    if (period !== "all" && normalize(work.period) !== normalize(period)) {
      return false;
    }
    if (!query) return true;
    const associatedPlaces = places
      .filter((place) => place.works.includes(work.id))
      .flatMap((place) => [place.name, ...(place.aliases || [])]);
    const searchable = [
      work.title,
      work.author,
      work.period,
      work.tradition,
      work.genre,
      work.type,
      work.journeyType,
      work.journeyModes || [],
      work.summary,
      work.characters || [],
      work.stops || [],
      work.stopDetails || [],
      associatedPlaces,
    ];
    return normalize(searchable.flat(Infinity).join(" ")).includes(query);
  };

  const renderWorkList = () => {
    let visibleCount = 0;
    workList.querySelectorAll("[data-work-item]").forEach((item) => {
      const work = worksById.get(item.dataset.workId);
      const visible = work && workMatchesFilters(work);
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    resultCount.textContent = String(visibleCount);
    noResults.hidden = visibleCount > 0;
    clearSearchButton.hidden = !searchInput.value;
  };

  const focusPlace = (place, stopIndex = -1) => {
    const marker = markersByPlaceId.get(place.id);
    if (!marker) return;
    selectedStopIndex = stopIndex;
    if (stopIndex >= 0) {
      currentStopIndex = stopIndex;
      updateCurrentStopLabel();
    }
    updateMarkers();
    const zoom = Math.max(map.getZoom(), 6);
    map.setView(coordinatesOf(place), zoom, { animate: !reducedMotion });
    openPlacePopup(marker);
  };

  const renderWorkDetails = (work) => {
    const creator = creatorOf(work);
    const stops = getWorkStops(work);
    const mappedCount = stops.filter((stop) => stop.place).length;
    const stopItems = stops.length
      ? `<h3>Places in chronological order</h3><ol class="lp-map-work-stop-list">${stops
          .map((stop) => {
            const button = stop.place
              ? `<button type="button" class="lp-map-stop-button" data-stop-index="${stop.index}" data-place-id="${escapeHTML(stop.place.id)}"><span class="lp-map-stop-line"><span class="lp-map-stop-name">${escapeHTML(stop.name)}</span><span class="lp-map-stop-note">View on map</span></span><span class="lp-map-stop-detail">${escapeHTML(stop.detail)}</span></button>`
              : `<button type="button" class="lp-map-stop-button" disabled><span class="lp-map-stop-line"><span class="lp-map-stop-name">${escapeHTML(stop.name)}</span><span class="lp-map-stop-note">No verified pin</span></span><span class="lp-map-stop-detail">${escapeHTML(stop.detail)}</span></button>`;
            const mode = journeyModeInfo((work.journeyModes || [])[stop.index]);
            const connector =
              stop.index < stops.length - 1
                ? `<span class="lp-map-stop-route-mode" title="${escapeHTML(mode.label)}"><span aria-hidden="true">${mode.icon}</span><span>${escapeHTML(mode.label)}</span></span>`
                : "";
            return `<li>${button}${connector}</li>`;
          })
          .join("")}</ol>`
      : '<p class="lp-map-work-note">No narrative stops are listed for this entry.</p>';
    const notes = [];
    if (work.metadataNote) notes.push(`<p class="lp-map-work-note">${escapeHTML(work.metadataNote)}</p>`);
    const summary = work.summary
      ? `<p class="lp-map-work-summary">${escapeHTML(work.summary)}</p>`
      : "";
    const article = safeLink(work.article);
    const title = article
      ? `<h2><a class="lp-map-work-link" href="${escapeHTML(article)}">${escapeHTML(work.title)}</a></h2>`
      : `<h2>${escapeHTML(work.title)}</h2>`;
    const mappedNote = mappedCount
      ? `<p class="lp-map-work-note">${mappedCount} of ${stops.length} listed stops have map markers. Regional and schematic placements are identified in the location notes.</p>`
      : '<p class="lp-map-work-note">No stops have map markers; place names remain in the ordered list.</p>';

    workDetails.innerHTML = [
      '<div class="lp-map-work-details">',
      title,
      `<p class="lp-map-work-meta">${escapeHTML(creator)}${work.year ? ` · ${escapeHTML(work.year)}` : ""}</p>`,
      `<p class="lp-map-work-meta">${escapeHTML(work.tradition || "")}${work.period ? ` · ${escapeHTML(work.period)}` : ""}${work.type ? ` · ${escapeHTML(work.type)}` : ""}</p>`,
      work.journeyType
        ? `<p class="lp-map-work-meta">Journey type · ${escapeHTML(work.journeyType)}</p>`
        : "",
      summary,
      stopItems,
      mappedNote,
      notes.join(""),
      "</div>",
    ].join("");

    workDetails.querySelectorAll("[data-stop-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const place = placesById.get(button.dataset.placeId);
        if (place) focusPlace(place, Number(button.dataset.stopIndex));
      });
    });
  };

  const selectWork = (work) => {
    selectedWork = work;
    focusedPlaceId = null;
    selectedStopIndex = -1;
    clearJourney();
    renderWorkDetails(work);
    catalogueView.hidden = true;
    workView.hidden = false;
    workList.querySelectorAll("[data-work-id]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.workId === work.id),
      );
    });
    updateMarkers();

    const matchedPlaces = getWorkStops(work)
      .map((stop) => stop.place)
      .filter(Boolean);
    if (matchedPlaces.length) {
      const bounds = window.L.latLngBounds(
        matchedPlaces.map((place) => coordinatesOf(place)),
      );
      const localRoute =
        bounds.getNorthEast().distanceTo(bounds.getSouthWest()) < 25000;
      map.fitBounds(bounds, {
        padding: [55, 55],
        maxZoom: localRoute ? 11 : 6,
      });
    } else {
      places.forEach((place) => {
        const marker = markersByPlaceId.get(place.id);
        if (marker && map.hasLayer(marker)) map.removeLayer(marker);
      });
      map.setView([32, 12], 2, { animate: !reducedMotion });
    }

    configureJourney(work);
    if (currentStopIndex >= 0) showJourneyStop(currentStopIndex, false);
  };

  workList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-work-id]");
    if (!button) return;
    const work = worksById.get(button.dataset.workId);
    if (work) selectWork(work);
  });

  sidebar.addEventListener("click", (event) => {
    const button = event.target.closest(
      ".lp-map-place-directory [data-place-id]",
    );
    if (!button) return;
    const place = placesById.get(button.dataset.placeId);
    if (!place || !markersByPlaceId.has(place.id)) return;

    selectedWork = null;
    focusedPlaceId = place.id;
    selectedStopIndex = -1;
    clearJourney();
    workView.hidden = true;
    catalogueView.hidden = false;
    workList.querySelectorAll("[data-work-id]").forEach((workButton) => {
      workButton.setAttribute("aria-pressed", "false");
    });
    updateMarkers();
    const marker = markersByPlaceId.get(place.id);
    if (window.matchMedia("(max-width: 768px)").matches) {
      showSidebar(false);
    }
    map.setView(coordinatesOf(place), Math.max(map.getZoom(), 6), {
      animate: !reducedMotion,
    });
    openPlacePopup(marker);
  });

  const returnToCatalogue = (resetFilters = false) => {
    selectedWork = null;
    focusedPlaceId = null;
    selectedStopIndex = -1;
    clearJourney();
    workView.hidden = true;
    catalogueView.hidden = false;
    if (resetFilters) {
      searchInput.value = "";
      periodFilter.value = "all";
    }
    workList.querySelectorAll("[data-work-id]").forEach((button) => {
      button.setAttribute("aria-pressed", "false");
    });
    updateMarkers();
    renderWorkList();
    map.setView([32, 12], 2, { animate: !reducedMotion });
  };

  backButton.addEventListener("click", () => returnToCatalogue());

  let hadSearch = searchInput.value.length > 0;
  const handleSearchInput = () => {
    const hasSearch = searchInput.value.length > 0;
    if (!hasSearch && hadSearch) {
      hadSearch = false;
      returnToCatalogue(true);
      return;
    }
    hadSearch = hasSearch;
    renderWorkList();
  };
  searchInput.addEventListener("input", handleSearchInput);
  searchInput.addEventListener("change", handleSearchInput);
  periodFilter.addEventListener("input", renderWorkList);
  periodFilter.addEventListener("change", renderWorkList);

  clearSearchButton.addEventListener("click", () => {
    hadSearch = false;
    returnToCatalogue(true);
    searchInput.focus();
  });

  renderWorkList();
  updateMarkers();
  window.requestAnimationFrame(() => map.invalidateSize());
})();
