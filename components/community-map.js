(function attachCommunityMap(global) {
  global.DavinciCommunityMap = {
    init: function initCommunityMap(root) {
      var scope = root || document;
      const topbar = scope.querySelector(".topbar");
      const mapStage = scope.querySelector(".map-stage");
      if (!mapStage || mapStage.dataset.communityMapInitialized === "true") return;
      mapStage.dataset.communityMapInitialized = "true";
      const mapSurface = scope.querySelector(".map-surface");
      const hungaryTrigger = scope.querySelector(".hungary-trigger");
      const romaniaTrigger = scope.querySelector(".romania-trigger");
      const mapNote = scope.querySelector(".map-note");
      const initialCountry = mapStage.dataset.mapInitialCountry || "europe";
      const dashboardSearchInput = scope.querySelector(".map-dashboard-panel .map-search-input");
      const dashboardPanel = scope.querySelector(".map-dashboard-panel");
      const dashboardPanelToggle = scope.querySelector(".map-dashboard-toggle");
      const dashboardList = scope.querySelector("[data-dashboard-list]");
      const dashboardSubmissionsView = scope.querySelector("[data-dashboard-submissions-view]");
      const dashboardDay = scope.querySelector("[data-dashboard-day]");
      const dashboardQuestForm = scope.querySelector("[data-dashboard-quest-form]");
      const dashboardQuestCoords = scope.querySelector("[data-dashboard-quest-coords]");
      const dashboardCreateQuest = scope.querySelector("[data-dashboard-create-quest]");
      const dashboardQuestCancel = scope.querySelector("[data-dashboard-quest-cancel]");
      const playersSearchInput = scope.querySelector(".map-player-search-input");
      const playersPanel = scope.querySelector(".map-players-panel");
      const playersPanelToggle = scope.querySelector(".map-players-panel-toggle");
      const playersPanelList = scope.querySelector("[data-players-panel-list]");
      const playerDrawer = scope.querySelector(".player-drawer");
      const drawerClose = scope.querySelector(".drawer-close");
      const questDrawer = scope.querySelector(".quest-drawer");
      const questClose = scope.querySelector(".quest-close");
      const backToEurope = scope.querySelector(".back-to-europe");
      const drawerHeading = scope.querySelector("[data-drawer-heading]");
      const drawerCard = scope.querySelector("[data-drawer-card]");
      const drawerFire = scope.querySelector("[data-drawer-fire]");
      const drawerTitle = scope.querySelector("[data-drawer-title]");
      const drawerCopy = scope.querySelector("[data-drawer-copy]");
      const drawerPoints = scope.querySelector("[data-drawer-points]");
      const drawerRegion = scope.querySelector("[data-drawer-region]");
      const playerMarkers = Array.from(scope.querySelectorAll(".player-marker"));
      const questMarkers = Array.from(scope.querySelectorAll(".quest-marker"));
      const questHeading = questDrawer?.querySelector("[data-quest-heading]");
      const questTitle = questDrawer?.querySelector("[data-quest-title]");
      const questSubtitle = questDrawer?.querySelector("[data-quest-subtitle]");
      const questRegion = questDrawer?.querySelector("[data-quest-region]");
      const questLocation = questDrawer?.querySelector("[data-quest-location]");
      const questCopy = questDrawer?.querySelector("[data-quest-copy]");
      const questProgress = questDrawer?.querySelector("[data-quest-progress]");
      const questReward = questDrawer?.querySelector("[data-quest-reward]");
      const questAccept = scope.querySelector("[data-quest-accept]");
      const questActionBlock = questDrawer?.querySelector("[data-quest-action-block]");
      const questProof = questDrawer?.querySelector("[data-quest-proof]");
      const questProofInput = questDrawer?.querySelector("[data-quest-proof-input]");
      const questProofFile = questDrawer?.querySelector("[data-quest-proof-file]");
      const questProofPreview = questDrawer?.querySelector("[data-quest-proof-preview]");
      const questProofImage = questDrawer?.querySelector("[data-quest-proof-image]");
      const questProofStatus = questDrawer?.querySelector("[data-quest-proof-status]");
      const questNavigation = questDrawer?.querySelector("[data-quest-navigation]");
      const EUROPE_SCALE = 1.12;
      const EUROPE_FOCUS = { x: 0.53, y: 0.5 };
      const HUNGARY_ENTRY_SCALE = 1.58;
      const HUNGARY_FOCUS = { x: 0.5, y: 0.5 };
      const ROMANIA_ENTRY_SCALE = 1.5;
      const ROMANIA_FOCUS = { x: 0.5, y: 0.53 };
      const MOBILE_BREAKPOINT = 720;
      const COMMUNITY_OWNER = true;
      const questState = new Map();
      const questSubmissionState = new Map();
      let activeQuestMarker = null;
      let draftQuest = null;
      let activeDashboardQuestMarker = null;
      const allPlayerEntries = Array.from(new Map(playerMarkers.map((marker) => [marker.dataset.playerName, {
        name: marker.dataset.playerName || "Player",
        level: Number(marker.dataset.playerLevel || 1),
        fire: Number(String(marker.dataset.playerFire || "1").replace(/\D/g, "") || 1),
        image: marker.dataset.playerImage || "./assets/membership-6.png",
        title: marker.dataset.playerTitle || "Explorer",
        copy: marker.dataset.playerCopy || "",
        marker
      }])).values());
      const allQuestEntries = questMarkers.map((marker) => ({
        title: marker.dataset.questTitle || "Quest",
        region: marker.dataset.questRegion || "Region",
        subtitle: marker.dataset.questSubtitle || "",
        location: marker.dataset.questLocation || "",
        task: marker.dataset.questTask || "",
        reward: marker.dataset.questReward || "0 points",
        created: marker.dataset.questCreated || "",
        createdAt: marker.dataset.questCreated ? new Date(marker.dataset.questCreated) : new Date(0),
        completedCount: Number(marker.dataset.questCompleted || 0),
        marker
      }));
      let selectedMapPlayerName = "";

      const syncTopbarState = () => {
        if (!topbar) return;
        topbar.classList.toggle("is-compact", window.scrollY > 24);
      };

      const panState = {
        x: 0,
        y: 0,
        scale: 1.12,
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        dragging: false,
        startX: 0,
        startY: 0,
        activeMap: "europe"
      };

      const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

      const renderSurface = () => {
        if (!mapSurface) return;
        mapSurface.style.transform = `translate(${panState.x}px, ${panState.y}px) scale(${panState.scale})`;
      };

      const syncMapLabel = () => {
        if (!mapNote) return;
        const labels = {
          europe: "Map: Europe",
          hungary: "Map: Hungary",
          romania: "Map: Romania"
        };
        mapNote.textContent = labels[panState.activeMap] || "Map: Europe";
      };

      const countryNameForMap = (map) => {
        if (map === "hungary") return "Hungary";
        if (map === "romania") return "Romania";
        return "Europe";
      };

      const updateDashboardMode = () => {
        if (!dashboardPanel) return;
        const mobileWorkMode = window.innerWidth <= MOBILE_BREAKPOINT && (Boolean(draftQuest?.formOpen) || Boolean(activeDashboardQuestMarker));
        if (mobileWorkMode) {
          setDashboardPanelCollapsed(false);
          setPlayersPanelCollapsed(true);
        }
        dashboardPanel.classList.toggle("is-owner-active", COMMUNITY_OWNER && (panState.activeMap === "hungary" || panState.activeMap === "romania"));
        dashboardPanel.classList.toggle("is-owner-europe", COMMUNITY_OWNER && panState.activeMap === "europe");
        dashboardPanel.classList.toggle("has-draft-quest", Boolean(draftQuest));
        dashboardPanel.classList.toggle("is-form-mode", Boolean(draftQuest?.formOpen));
        dashboardPanel.classList.toggle("is-submissions-mode", Boolean(activeDashboardQuestMarker));
      };

      const getActiveQuestOverlay = () => {
        if (panState.activeMap === "hungary") {
          return scope.querySelector(".hungary-overlay");
        }
        if (panState.activeMap === "romania") {
          return scope.querySelector(".romania-overlay");
        }
        return null;
      };

      const updateDraftQuestPosition = (xPercent, yPercent) => {
        if (!draftQuest?.marker || !draftQuest?.tip) return;
        const left = clamp(xPercent, 6, 94);
        const top = clamp(yPercent, 12, 92);
        draftQuest.x = left;
        draftQuest.y = top;
        draftQuest.marker.style.left = `${left}%`;
        draftQuest.marker.style.top = `${top}%`;
        draftQuest.tip.style.left = `${clamp(left - 0.9, 12, 83)}%`;
        draftQuest.tip.style.top = `${clamp(top - 17.5, 3, 77)}%`;
        if (dashboardQuestCoords) {
          dashboardQuestCoords.textContent = `x: ${left.toFixed(1)}%, y: ${top.toFixed(1)}%`;
        }
      };

      const clearDraftQuest = () => {
        if (draftQuest?.marker) draftQuest.marker.remove();
        if (draftQuest?.tip) draftQuest.tip.remove();
        draftQuest = null;
        if (dashboardQuestForm) dashboardQuestForm.reset();
        if (dashboardQuestCoords) dashboardQuestCoords.textContent = "Waiting for marker placement";
        updateDashboardMode();
      };

      const closeDashboardSubmissions = () => {
        activeDashboardQuestMarker = null;
        updateDashboardMode();
      };

      const bindQuestMarker = (marker) => {
        syncQuestMarkerState(marker);

        marker.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
        });

        marker.addEventListener("click", (event) => {
          event.stopPropagation();
          const questHref = marker.dataset.questHref;
          if (questHref) {
            window.location.hash = questHref;
            return;
          }
          openQuestDrawer(marker);
        });
      };

      const openDraftQuestForm = () => {
        if (!draftQuest || !dashboardQuestForm) return;
        draftQuest.formOpen = true;
        dashboardQuestForm.reset();
        dashboardQuestForm.elements.country.value = countryNameForMap(panState.activeMap);
        dashboardQuestForm.elements.created.value = "2026-04-08";
        dashboardQuestForm.elements.reward.value = "200";
        updateDraftQuestPosition(draftQuest.x, draftQuest.y);
        setDashboardPanelCollapsed(false);
        updateDashboardMode();
      };

      const createDraftQuest = () => {
        const overlay = getActiveQuestOverlay();
        if (!overlay || !COMMUNITY_OWNER) return;
        clearDraftQuest();
        closeQuestDrawer();
        closeDrawer();
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "quest-marker is-draft";
        marker.textContent = "Q";
        marker.setAttribute("aria-label", "Draft quest marker");

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.className = "draft-quest-confirm";
        confirmButton.textContent = "✓";
        confirmButton.setAttribute("aria-label", "Confirm quest marker position");

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "draft-quest-cancel";
        cancelButton.textContent = "×";
        cancelButton.setAttribute("aria-label", "Cancel draft quest");

        const tip = document.createElement("div");
        tip.className = "draft-quest-tip";
        tip.innerHTML = `
          <p class="draft-quest-tip-copy">Place the marker on the right county, then press ✓ to fill the quest details. Press × to cancel.</p>
          <div class="draft-quest-tip-actions"></div>
        `;
        tip.querySelector(".draft-quest-tip-actions")?.append(confirmButton, cancelButton);

        overlay.append(marker, tip);
        draftQuest = { marker, confirmButton, cancelButton, tip, overlay, x: 50, y: 50, formOpen: false };
        updateDraftQuestPosition(50, 50);

        marker.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
          marker.setPointerCapture(event.pointerId);
        });

        marker.addEventListener("pointermove", (event) => {
          if (!marker.hasPointerCapture(event.pointerId)) return;
          event.stopPropagation();
          const rect = overlay.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          updateDraftQuestPosition(x, y);
        });

        marker.addEventListener("pointerup", (event) => {
          if (marker.hasPointerCapture(event.pointerId)) {
            marker.releasePointerCapture(event.pointerId);
          }
        });

        confirmButton.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
        });

        confirmButton.addEventListener("click", (event) => {
          event.stopPropagation();
          openDraftQuestForm();
        });

        cancelButton.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
        });

        cancelButton.addEventListener("click", (event) => {
          event.stopPropagation();
          clearDraftQuest();
        });
      };

      const setDashboardPanelCollapsed = (isCollapsed) => {
        if (!dashboardPanel || !dashboardPanelToggle) return;
        dashboardPanel.classList.toggle("is-collapsed", isCollapsed);
        dashboardPanelToggle.textContent = isCollapsed ? "+" : "−";
      };

      const setPlayersPanelCollapsed = (isCollapsed) => {
        if (!playersPanel || !playersPanelToggle) return;
        playersPanel.classList.toggle("is-collapsed", isCollapsed);
        playersPanelToggle.textContent = isCollapsed ? "+" : "−";
      };

      const renderDashboardPanel = () => {
        if (!dashboardList || !dashboardSubmissionsView) return;
        const query = (dashboardSearchInput?.value || "").trim().toLowerCase();
        const visibleQuests = allQuestEntries
          .filter((quest) => {
            if (!query) return true;
            return quest.title.toLowerCase().includes(query) || quest.region.toLowerCase().includes(query);
          })
          .sort((a, b) => b.createdAt - a.createdAt);

        if (dashboardDay) {
          dashboardDay.textContent = "Day 18 of the Grand Tour";
        }

        const getPendingSubmissionCount = (marker) => (questSubmissionState.get(marker) || []).length;

        dashboardList.innerHTML = visibleQuests.map((quest) => (
          `<div class="map-dashboard-card" data-open-quest="${quest.title}">
            <div class="map-dashboard-card-top">
              <strong>${quest.title}</strong>
              <span class="map-dashboard-card-date">${quest.created || "Unknown date"}</span>
            </div>
            <div class="map-dashboard-card-meta">
              <p class="map-dashboard-card-region">${quest.region}</p>
              <span class="map-dashboard-card-completed">${getPendingSubmissionCount(quest.marker)} pending</span>
            </div>
          </div>`
        )).join("");

        if (!visibleQuests.length) {
          dashboardList.innerHTML = '<div class="map-dashboard-card is-empty"><strong>No quests found</strong></div>';
        }

        dashboardList.querySelectorAll("[data-open-quest]").forEach((card) => {
          card.addEventListener("pointerdown", (event) => {
            event.stopPropagation();
          });

          card.addEventListener("click", (event) => {
            event.stopPropagation();
            const title = card.getAttribute("data-open-quest");
            const quest = allQuestEntries.find((entry) => entry.title === title);
            if (!quest) return;
            activeDashboardQuestMarker = quest.marker;
            updateDashboardMode();
            renderDashboardPanel();
          });
        });

        const submissions = activeDashboardQuestMarker ? (questSubmissionState.get(activeDashboardQuestMarker) || []) : [];
        const dashboardQuest = activeDashboardQuestMarker
          ? allQuestEntries.find((entry) => entry.marker === activeDashboardQuestMarker)
          : null;

        if (!activeDashboardQuestMarker) {
          dashboardSubmissionsView.innerHTML = "";
          return;
        }

        dashboardSubmissionsView.innerHTML = `
          <div class="dashboard-submissions-head">
            <p class="dashboard-submissions-title">${dashboardQuest?.title || "Quest submissions"}</p>
            <button class="dashboard-submissions-back" type="button" data-dashboard-submissions-back>Back</button>
          </div>
          ${submissions.length ? submissions.map((submission, index) => `
            <div class="dashboard-submission-card">
              <div class="dashboard-submission-meta">
                <span>Submission ${index + 1}</span>
                <span>${submission.name}</span>
              </div>
              <img class="dashboard-submission-image" src="${submission.url}" alt="Quest submission ${index + 1}">
              <button class="dashboard-submission-accept" type="button" data-dashboard-accept-submission="${index}">Accept submission</button>
            </div>
          `).join("") : '<div class="map-dashboard-card is-empty"><strong>No submissions yet</strong></div>'}
        `;

        dashboardSubmissionsView.querySelector("[data-dashboard-submissions-back]")?.addEventListener("click", (event) => {
          event.stopPropagation();
          closeDashboardSubmissions();
        });

        dashboardSubmissionsView.querySelectorAll("[data-dashboard-accept-submission]").forEach((acceptButton) => {
          acceptButton.addEventListener("click", (event) => {
            event.stopPropagation();
            if (!activeDashboardQuestMarker) return;
            const submissionIndex = Number(acceptButton.getAttribute("data-dashboard-accept-submission"));
            const pending = questSubmissionState.get(activeDashboardQuestMarker) || [];
            if (!pending[submissionIndex]) return;
            questSubmissionState.set(activeDashboardQuestMarker, pending.filter((_, index) => index !== submissionIndex));
            const questEntry = allQuestEntries.find((entry) => entry.marker === activeDashboardQuestMarker);
            if (questEntry) questEntry.completedCount += 1;
            questState.set(activeDashboardQuestMarker, (questSubmissionState.get(activeDashboardQuestMarker) || []).length ? "Submitted" : "Completed");
            syncQuestMarkerState(activeDashboardQuestMarker);
            renderDashboardPanel();
            if (activeQuestMarker === activeDashboardQuestMarker) {
              openQuestDrawer(activeDashboardQuestMarker);
            }
          });
        });
      };

      const renderPlayersPanel = () => {
        if (!playersPanelList) return;
        const query = (playersSearchInput?.value || "").trim().toLowerCase();
        const visiblePlayers = allPlayerEntries
          .filter((player) => !query || player.name.toLowerCase().includes(query))
          .sort((a, b) => (b.level + b.fire) - (a.level + a.fire));

        playersPanelList.innerHTML = visiblePlayers.map((player, index) => (
          `<div class="map-player-card" data-highlight-player="${player.name}">
            <span class="map-player-card-index">${index + 1}</span>
            <img src="${player.image}" alt="">
            <div><strong>${player.name}</strong></div>
            <span class="map-player-card-points">${player.marker.dataset.playerPoints || Number(player.level || 1) * 520}</span>
          </div>`
        )).join("");

        if (!visiblePlayers.length) {
          playersPanelList.innerHTML = '<div class="map-player-card is-empty"><div><strong>No players found</strong></div></div>';
        }

        playersPanelList.querySelectorAll("[data-highlight-player]").forEach((card) => {
          card.addEventListener("pointerdown", (event) => {
            event.stopPropagation();
          });

          card.addEventListener("click", (event) => {
            event.stopPropagation();
            const name = card.getAttribute("data-highlight-player");
            selectedMapPlayerName = name || "";
            syncMarkerSearch();
            const player = allPlayerEntries.find((entry) => entry.name === name);
            if (player) openDrawerForPlayer(player.marker);
          });
        });
      };

      const buildPlayerCardBadges = (button) => {
        const level = button.dataset.playerLevel || "1";
        const fire = button.dataset.playerFire || "1X";
        return [
          { text: level, label: `Level ${level}`, variant: "accent" },
          { iconName: "edit", label: button.dataset.playerName || "Player" },
          { iconName: "shield", label: button.dataset.playerTitle || "Role" },
          { iconName: "star", label: `${fire} fire streak` },
          { iconName: "crown", label: panState.activeMap || "europe" }
        ];
      };

      const getQuestStatus = (marker) => {
        if (!marker) return "Open";
        return questState.get(marker) || marker.dataset.questStatus || "Open";
      };

      const getQuestDisplayStatus = (status) => {
        if (status === "Processing") return "Submitted";
        if (status === "In progress") return "Open";
        return status || "Open";
      };

      const getQuestStatusClass = (status) => getQuestDisplayStatus(status).toLowerCase().replace(/\s+/g, "-");

      const syncQuestMarkerState = (marker) => {
        if (!marker) return;
        const status = getQuestStatus(marker);
        marker.classList.remove("is-open", "is-submitted", "is-completed", "is-rejected");
        marker.classList.add(`is-${getQuestStatusClass(status)}`);
      };

      const markerIsVisibleInCurrentMap = (marker) => {
        const overlay = marker.closest(".map-overlay");
        if (!overlay) return true;
        if (overlay.classList.contains("hungary-overlay")) return panState.activeMap === "hungary";
        if (overlay.classList.contains("romania-overlay")) return panState.activeMap === "romania";
        if (overlay.classList.contains("europe-overlay")) return panState.activeMap === "europe";
        return true;
      };

      const syncMarkerSearch = () => {
        playerMarkers.forEach((marker) => {
          marker.classList.remove("is-dim", "is-match", "is-selected");

          if (!markerIsVisibleInCurrentMap(marker)) return;

          const name = (marker.dataset.playerName || "").toLowerCase();

          if (selectedMapPlayerName && name === selectedMapPlayerName.toLowerCase()) {
            marker.classList.add("is-selected");
          }
        });
      };

      const openDrawerForPlayer = (button) => {
        if (!playerDrawer || !button) return;
        closeQuestDrawer();
        if (drawerCard) {
          drawerCard.innerHTML = DavinciUserCard.render({
            image: button.dataset.playerImage || "./assets/membership-6.png",
            alt: `${button.dataset.playerName || "Player"} user card`,
            badges: buildPlayerCardBadges(button),
            width: "190px"
          });
        }
        if (drawerHeading) {
          drawerHeading.textContent = button.dataset.playerName || "Player";
        }
        drawerCopy.textContent = button.dataset.playerCopy || "";
        drawerPoints.textContent = button.dataset.playerPoints || String(Number(button.dataset.playerLevel || 1) * 520);
        drawerRegion.textContent = button.dataset.playerTitle || "Map";
        playerDrawer.classList.add("is-open");
        playerDrawer.setAttribute("aria-hidden", "false");
      };

      const closeDrawer = () => {
        if (!playerDrawer) return;
        playerDrawer.classList.remove("is-open");
        playerDrawer.setAttribute("aria-hidden", "true");
      };

      const openQuestDrawer = (button) => {
        if (!questDrawer || !button) return;
        closeDrawer();
        activeQuestMarker = button;
        const currentStatus = getQuestStatus(button);
        const displayStatus = getQuestDisplayStatus(currentStatus);
        const compactMeta = [
          button.dataset.questSubtitle || "",
          button.dataset.questRegion || "",
          button.dataset.questReward || ""
        ].filter(Boolean).join(" · ");
        if (questHeading) {
          questHeading.textContent = compactMeta || button.dataset.questTitle || "Quest title";
        }
        questTitle.textContent = button.dataset.questTitle || "Quest";
        const subtitle = button.dataset.questSubtitle || "";
        questSubtitle.textContent = subtitle;
        questRegion.textContent = button.dataset.questRegion || "Region";
        questLocation.textContent = button.dataset.questLocation || "The route crosses a high-traffic zone with shifting control, limited recovery windows, and frequent pressure from nearby lanes. Expect short reaction times and contested checkpoints.";
        questCopy.textContent = button.dataset.questTask || button.dataset.questCopy || "";
        if (questProgress) {
          questProgress.classList.remove("is-open", "is-submitted", "is-completed", "is-rejected");
          questProgress.classList.add(`is-${getQuestStatusClass(currentStatus)}`);
          questProgress.textContent = displayStatus;
        }
        if (questReward) {
          questReward.classList.add("is-visible");
          questReward.textContent = `Reward: ${button.dataset.questReward || "0 points"}`;
        }
        const pendingSubmissions = questSubmissionState.get(button) || [];
        if (questProof) {
          questProof.classList.toggle("is-visible", currentStatus === "Open" || currentStatus === "In progress" || currentStatus === "Processing" || currentStatus === "Submitted" || currentStatus === "Rejected");
        }
        const questProofUpload = questDrawer?.querySelector(".quest-proof-upload");
        if (questProofUpload) {
          questProofUpload.classList.toggle("is-hidden", currentStatus === "Processing" || currentStatus === "Submitted");
        }
        if (questActionBlock) {
          questActionBlock.classList.toggle("is-hidden", currentStatus === "In progress" || currentStatus === "Processing" || currentStatus === "Submitted" || currentStatus === "Completed");
        }
        if (questProofInput) {
          questProofInput.value = "";
        }
        if (questProofFile) {
          questProofFile.textContent = currentStatus === "Processing" || currentStatus === "Submitted" ? "Image uploaded" : "No file selected";
        }
        const proofState = pendingSubmissions[0];
        if (questProofPreview && questProofImage && questProofStatus) {
          const hasPreview = Boolean(proofState?.url);
          questProofPreview.classList.toggle("is-visible", hasPreview);
          questProofImage.src = hasPreview ? proofState.url : "";
          questProofStatus.textContent = hasPreview
            ? "Uploaded image is under review."
            : "Uploaded image is under review.";
        }
        if (questAccept) {
          const inProgress = currentStatus === "In progress";
          const processing = currentStatus === "Processing" || currentStatus === "Submitted";
          const completed = currentStatus === "Completed";
          const rejected = currentStatus === "Rejected";
          questAccept.disabled = inProgress || processing || completed;
          questAccept.textContent = completed ? "Quest completed" : (processing ? "Submitted" : (rejected ? "Submit" : (inProgress ? "Task in progress" : "Submit")));
        }
        if (questNavigation) {
          const navigationUrl = button.dataset.questNavigationUrl || "";
          questNavigation.classList.toggle("is-hidden", !navigationUrl);
          questNavigation.href = navigationUrl || "#";
        }
        questDrawer.classList.add("is-open");
        questDrawer.setAttribute("aria-hidden", "false");
      };

      const closeQuestDrawer = () => {
        if (!questDrawer) return;
        activeQuestMarker = null;
        questDrawer.classList.remove("is-open");
        questDrawer.setAttribute("aria-hidden", "true");
      };

      const backToEuropeView = () => {
        if (!mapSurface || panState.activeMap === "europe") return;
        closeDashboardSubmissions();
        clearDraftQuest();
        closeDrawer();
        closeQuestDrawer();
        mapSurface.classList.remove("is-hungary-view");
        mapSurface.classList.remove("is-romania-view");
        panState.activeMap = "europe";
        focusSurface(EUROPE_FOCUS.x, EUROPE_FOCUS.y, EUROPE_SCALE);
        syncMapLabel();
        syncMarkerSearch();
        renderDashboardPanel();
        updateDashboardMode();
      };

      const updateBounds = () => {
        if (!mapStage || !mapSurface) return;

        const stageRect = mapStage.getBoundingClientRect();
        const scaledWidth = mapSurface.offsetWidth * panState.scale;
        const scaledHeight = mapSurface.offsetHeight * panState.scale;
        panState.maxX = 0;
        panState.maxY = 0;
        panState.minX = Math.min(stageRect.width - scaledWidth, 0);
        panState.minY = Math.min(stageRect.height - scaledHeight, 0);
        panState.x = clamp(panState.x, panState.minX, panState.maxX);
        panState.y = clamp(panState.y, panState.minY, panState.maxY);
        renderSurface();
      };

      const focusSurface = (xRatio, yRatio, scale) => {
        if (!mapStage || !mapSurface) return;

        const stageRect = mapStage.getBoundingClientRect();
        const scaledWidth = mapSurface.offsetWidth * scale;
        const scaledHeight = mapSurface.offsetHeight * scale;

        panState.scale = scale;
        panState.maxX = 0;
        panState.maxY = 0;
        panState.minX = Math.min(stageRect.width - scaledWidth, 0);
        panState.minY = Math.min(stageRect.height - scaledHeight, 0);
        panState.x = clamp(stageRect.width / 2 - scaledWidth * xRatio, panState.minX, panState.maxX);
        panState.y = clamp(stageRect.height / 2 - scaledHeight * yRatio, panState.minY, panState.maxY);
        updateBounds();
      };

      const startDrag = (clientX, clientY) => {
        if (!mapStage) return;
        panState.dragging = true;
        panState.startX = clientX - panState.x;
        panState.startY = clientY - panState.y;
        mapStage.classList.add("is-dragging");
        mapSurface.style.transition = "none";
      };

      const moveDrag = (clientX, clientY) => {
        if (!panState.dragging) return;
        panState.x = clamp(clientX - panState.startX, panState.minX, panState.maxX);
        panState.y = clamp(clientY - panState.startY, panState.minY, panState.maxY);
        renderSurface();
      };

      const stopDrag = () => {
        if (!mapStage) return;
        panState.dragging = false;
        mapStage.classList.remove("is-dragging");
        mapSurface.style.transition = "";
      };

      const zoomToHungary = () => {
        if (!mapSurface || panState.activeMap === "hungary") return;

        stopDrag();
        closeDashboardSubmissions();
        clearDraftQuest();
        closeDrawer();
        closeQuestDrawer();
        mapSurface.style.transition = "";
        focusSurface(0.556, 0.554, HUNGARY_ENTRY_SCALE);

        window.setTimeout(() => {
          panState.activeMap = "hungary";
          mapSurface.classList.remove("is-romania-view");
          mapSurface.classList.add("is-hungary-view");
          syncMapLabel();
          focusSurface(HUNGARY_FOCUS.x, HUNGARY_FOCUS.y, EUROPE_SCALE);
          syncMarkerSearch();
          renderDashboardPanel();
          updateDashboardMode();
        }, 260);
      };

      const zoomToRomania = () => {
        if (!mapSurface || panState.activeMap === "romania") return;

        stopDrag();
        closeDashboardSubmissions();
        clearDraftQuest();
        closeDrawer();
        closeQuestDrawer();
        mapSurface.style.transition = "";
        focusSurface(0.598, 0.675, ROMANIA_ENTRY_SCALE);

        window.setTimeout(() => {
          panState.activeMap = "romania";
          mapSurface.classList.remove("is-hungary-view");
          mapSurface.classList.add("is-romania-view");
          syncMapLabel();
          focusSurface(ROMANIA_FOCUS.x, ROMANIA_FOCUS.y, EUROPE_SCALE);
          syncMarkerSearch();
          renderDashboardPanel();
          updateDashboardMode();
        }, 260);
      };

      const setInitialMapView = () => {
        if (initialCountry === "hungary") {
          panState.activeMap = "hungary";
          mapSurface.classList.remove("is-romania-view");
          mapSurface.classList.add("is-hungary-view");
          focusSurface(HUNGARY_FOCUS.x, HUNGARY_FOCUS.y, EUROPE_SCALE);
          return;
        }

        if (initialCountry === "romania") {
          panState.activeMap = "romania";
          mapSurface.classList.remove("is-hungary-view");
          mapSurface.classList.add("is-romania-view");
          focusSurface(ROMANIA_FOCUS.x, ROMANIA_FOCUS.y, EUROPE_SCALE);
          return;
        }

        panState.activeMap = "europe";
        mapSurface.classList.remove("is-hungary-view");
        mapSurface.classList.remove("is-romania-view");
        focusSurface(EUROPE_FOCUS.x, EUROPE_FOCUS.y, EUROPE_SCALE);
      };

      syncTopbarState();
      setInitialMapView();
      syncMapLabel();
      renderDashboardPanel();
      renderPlayersPanel();
      setDashboardPanelCollapsed(window.innerWidth <= MOBILE_BREAKPOINT);
      setPlayersPanelCollapsed(window.innerWidth <= MOBILE_BREAKPOINT);
      syncMarkerSearch();
      updateDashboardMode();

      window.addEventListener("scroll", syncTopbarState, { passive: true });
      window.addEventListener("resize", () => {
        if (panState.activeMap === "hungary") {
          focusSurface(HUNGARY_FOCUS.x, HUNGARY_FOCUS.y, EUROPE_SCALE);
        } else if (panState.activeMap === "romania") {
          focusSurface(ROMANIA_FOCUS.x, ROMANIA_FOCUS.y, EUROPE_SCALE);
        } else {
          focusSurface(EUROPE_FOCUS.x, EUROPE_FOCUS.y, EUROPE_SCALE);
        }
      });

      mapStage?.addEventListener("pointerdown", (event) => {
        if (event.target === mapStage) {
          closeDrawer();
          closeQuestDrawer();
        }
        startDrag(event.clientX, event.clientY);
        mapStage.setPointerCapture(event.pointerId);
      });

      mapStage?.addEventListener("pointermove", (event) => {
        moveDrag(event.clientX, event.clientY);
      });

      mapStage?.addEventListener("pointerup", () => {
        stopDrag();
      });

      mapStage?.addEventListener("pointercancel", () => {
        stopDrag();
      });

      hungaryTrigger?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      hungaryTrigger?.addEventListener("click", (event) => {
        event.stopPropagation();
        zoomToHungary();
      });

      romaniaTrigger?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      romaniaTrigger?.addEventListener("click", (event) => {
        event.stopPropagation();
        zoomToRomania();
      });

      dashboardPanel?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      dashboardPanel?.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      dashboardPanelToggle?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      dashboardPanelToggle?.addEventListener("click", (event) => {
        event.stopPropagation();
        setDashboardPanelCollapsed(!dashboardPanel?.classList.contains("is-collapsed"));
      });

      dashboardCreateQuest?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      dashboardCreateQuest?.addEventListener("click", (event) => {
        event.stopPropagation();
        createDraftQuest();
      });

      playersPanel?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      playersPanel?.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      playersPanelToggle?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      playersPanelToggle?.addEventListener("click", (event) => {
        event.stopPropagation();
        setPlayersPanelCollapsed(!playersPanel?.classList.contains("is-collapsed"));
      });

      playerDrawer?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      playerDrawer?.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      questDrawer?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      questDrawer?.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      drawerClose?.addEventListener("click", () => {
        closeDrawer();
      });

      questClose?.addEventListener("click", () => {
        closeQuestDrawer();
      });

      questAccept?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      questProofInput?.addEventListener("change", () => {
        const hasFile = Boolean(questProofInput.files && questProofInput.files[0]);

        if (questProofFile) {
          questProofFile.textContent = hasFile
            ? questProofInput.files[0].name
            : "No file selected";
        }

        if (!hasFile || !activeQuestMarker) return;

        const previousSubmissions = questSubmissionState.get(activeQuestMarker) || [];
        previousSubmissions.forEach((submission) => {
          if (submission?.url) URL.revokeObjectURL(submission.url);
        });
        questSubmissionState.set(activeQuestMarker, [{
          url: URL.createObjectURL(questProofInput.files[0]),
          name: questProofInput.files[0].name
        }]);
        questState.set(activeQuestMarker, "Submitted");
        syncQuestMarkerState(activeQuestMarker);
        renderDashboardPanel();
        openQuestDrawer(activeQuestMarker);
      });

      questAccept?.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!activeQuestMarker) return;
        const currentStatus = getQuestStatus(activeQuestMarker);
        if (currentStatus === "In progress" || currentStatus === "Processing" || currentStatus === "Submitted" || currentStatus === "Completed") return;
        questState.set(activeQuestMarker, "In progress");
        syncQuestMarkerState(activeQuestMarker);
        renderDashboardPanel();
        openQuestDrawer(activeQuestMarker);
      });

      drawerClose?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      backToEurope?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      backToEurope?.addEventListener("click", (event) => {
        event.stopPropagation();
        backToEuropeView();
      });

      dashboardSearchInput?.addEventListener("input", () => {
        renderDashboardPanel();
      });

      dashboardSearchInput?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      dashboardSearchInput?.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      dashboardQuestCancel?.addEventListener("click", (event) => {
        event.stopPropagation();
        clearDraftQuest();
      });

      dashboardQuestForm?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      dashboardQuestForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!draftQuest) return;

        const formData = new FormData(dashboardQuestForm);
        const title = String(formData.get("title") || "").trim();
        const subtitle = String(formData.get("subtitle") || "").trim();
        const country = String(formData.get("country") || "").trim();
        const county = String(formData.get("county") || "").trim();
        const reward = String(formData.get("reward") || "0").trim();
        const created = String(formData.get("created") || "").trim();
        const location = String(formData.get("location") || "").trim();
        const task = String(formData.get("task") || "").trim();

        if (!title || !county || !created || !location || !task) return;

        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "quest-marker";
        marker.textContent = "Q";
        marker.style.left = `${draftQuest.x}%`;
        marker.style.top = `${draftQuest.y}%`;
        marker.dataset.questTitle = title;
        marker.dataset.questSubtitle = subtitle;
        marker.dataset.questRegion = `${country} · ${county}`;
        marker.dataset.questLocation = location;
        marker.dataset.questTask = task;
        marker.dataset.questReward = `${reward} points`;
        marker.dataset.questStatus = "Open";
        marker.dataset.questCompleted = "0";
        marker.dataset.questCreated = created;
        draftQuest.overlay.append(marker);

        allQuestEntries.push({
          title,
          region: `${country} · ${county}`,
          subtitle,
          location,
          task,
          reward: `${reward} points`,
          created,
          createdAt: new Date(created),
          completedCount: 0,
          marker
        });

        bindQuestMarker(marker);
        clearDraftQuest();
        renderDashboardPanel();
      });

      playersSearchInput?.addEventListener("input", () => {
        renderPlayersPanel();
      });

      playersSearchInput?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });

      playersSearchInput?.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      playerMarkers.forEach((marker) => {
        const image = marker.dataset.playerImage;
        if (image) {
          marker.innerHTML = `<img src="${image}" alt="">`;
        }

        marker.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
        });

        marker.addEventListener("click", (event) => {
          event.stopPropagation();
          openDrawerForPlayer(marker);
        });
      });

      questMarkers.forEach(bindQuestMarker);
    }
  };
})(window);
