import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { Download, Menu } from "lucide-react";
import Papa from "papaparse";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const App = () => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCount, setSelectedCount] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0);
  const gridRef = useRef(null);

  // Load CSV data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/spotify_songs.csv");
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            // initial displayed count should reflect page size (25) if pagination is used
            setRowData(results.data);
            const initialVisible = Math.min(results.data.length, 25);
            setDisplayedCount(initialVisible);
            setLoading(false);
          },
          error: (error) => {
            console.error("Parse error:", error);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error("Load error:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 48,
        maxWidth: 48,
        pinned: "left",
        filter: false,
        sortable: false,
        resizable: false,
        suppressMenu: true,
        lockPosition: true,
        headerClass: "checkbox-header", // used to hide icons in header for this column
        cellClass: "checkbox-col",
      },
      {
        headerName: "S.No",
        valueGetter: "node.rowIndex + 1",
        width: 80,
        pinned: "left",
        filter: false,
        sortable: false,
        cellStyle: {
          fontWeight: "500",
          textAlign: "center",
        },
        headerClass: "center-header",
      },
      {
        field: "track_name",
        headerName: "Track Name",
        minWidth: 250,
        flex: 2,
        filter: "agTextColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "track_artist",
        headerName: "Artist",
        minWidth: 180,
        flex: 1.5,
        filter: "agTextColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "track_album_name",
        headerName: "Album",
        minWidth: 200,
        flex: 1.5,
        filter: "agTextColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "track_popularity",
        headerName: "Popularity",
        width: 130,
        filter: "agNumberColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        cellStyle: { textAlign: "center" },
        headerClass: "center-header",
      },
      {
        field: "playlist_genre",
        headerName: "Genre",
        width: 130,
        filter: "agSetColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "playlist_subgenre",
        headerName: "Subgenre",
        width: 150,
        filter: "agSetColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "danceability",
        headerName: "Danceability",
        width: 140,
        filter: "agNumberColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        valueFormatter: (params) =>
          params.value ? parseFloat(params.value).toFixed(3) : "",
      },
      {
        field: "energy",
        headerName: "Energy",
        width: 120,
        filter: "agNumberColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        valueFormatter: (params) =>
          params.value ? parseFloat(params.value).toFixed(3) : "",
      },
      {
        field: "valence",
        headerName: "Valence",
        width: 120,
        filter: "agNumberColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        valueFormatter: (params) =>
          params.value ? parseFloat(params.value).toFixed(3) : "",
      },
      {
        field: "tempo",
        headerName: "Tempo",
        width: 110,
        filter: "agNumberColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        valueFormatter: (params) =>
          params.value ? parseFloat(params.value).toFixed(1) : "",
      },
      {
        field: "duration_ms",
        headerName: "Duration (ms)",
        width: 140,
        filter: "agNumberColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        valueFormatter: (params) =>
          params.value ? parseInt(params.value).toLocaleString() : "",
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      suppressMovable: true,
    }),
    []
  );

  // Handle grid ready
  const onGridReady = useCallback((params) => {
    // the original code set gridRef.current = params; keep same to avoid renaming issues
    gridRef.current = params;
    // ensure displayedCount reflects current page after grid ready (in case data already set)
    try {
      const api = params.api;
      const page = api.paginationGetPage();
      const pageSize = api.paginationGetPageSize();
      const totalFiltered = api.getDisplayedRowCount();
      const visible = Math.max(
        0,
        Math.min(pageSize, totalFiltered - page * pageSize)
      );
      setDisplayedCount(visible);
    } catch (e) {
      // ignore if pagination API not ready yet
    }
  }, []);

  // Handle selection change
  const onSelectionChanged = useCallback(() => {
    if (gridRef.current?.api) {
      // count only selected nodes that are currently displayed (visible in the grid view)
      const selectedVisible = gridRef.current.api
        .getSelectedNodes()
        .filter((n) => !!n.displayed).length;
      setSelectedCount(selectedVisible);
    }
  }, []);

  // Utility to update displayed count for the current page
  const updateDisplayedCountForPage = useCallback(() => {
    if (!gridRef.current?.api) return;
    const api = gridRef.current.api;
    const page =
      typeof api.paginationGetPage === "function" ? api.paginationGetPage() : 0;
    const pageSize =
      typeof api.paginationGetPageSize === "function"
        ? api.paginationGetPageSize()
        : 0;
    const totalFiltered = api.getDisplayedRowCount();

    // visible rows on current page
    const visible =
      pageSize > 0
        ? Math.max(0, Math.min(pageSize, totalFiltered - page * pageSize))
        : totalFiltered;
    setDisplayedCount(visible);
  }, []);

  // Handle filter change
  const onFilterChanged = useCallback(() => {
    // after filter change, recompute how many rows are visible on the current page
    updateDisplayedCountForPage();
    // also update selected visible count (selection might persist across pages, so recalc)
    onSelectionChanged();
  }, [onSelectionChanged, updateDisplayedCountForPage]);

  // Handle pagination change (update displayed + selected counts)
  const onPaginationChanged = useCallback(() => {
    updateDisplayedCountForPage();
    onSelectionChanged();
  }, [onSelectionChanged, updateDisplayedCountForPage]);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: "spotify_tracks_export.csv",
        columnKeys: columnDefs.map((col) => col.field).filter(Boolean),
      });
    }
  }, [columnDefs]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading Spotify tracks...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.menuButton}>
          <Menu size={24} color="white" />
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Spotify Tracks Dashboard</h1>
            <p style={styles.subtitle}>Last update 01/03/2023</p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={handleExport} style={styles.downloadButton}>
              <Download size={16} />
              Download Excel
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={styles.stats}>
            <span style={styles.statItem}>
              <strong>Total:</strong> {rowData.length.toLocaleString()}
            </span>
            <span style={styles.statItem}>
              <strong>Displayed:</strong> {displayedCount.toLocaleString()}
            </span>
            <span style={styles.statItem}>
              <strong>Selected:</strong> {selectedCount}
            </span>
          </div>
        </div>

        {/* AG Grid */}
        <div style={styles.gridContainer}>
          <div className="ag-theme-alpine" style={styles.grid}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={25}
              paginationPageSizeSelector={[25, 50, 100, 200]}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged}
              onFilterChanged={onFilterChanged}
              onPaginationChanged={onPaginationChanged}
              animateRows={true}
              enableCellTextSelection={true}
              suppressMenuHide={false}
              rowHeight={40}
              headerHeight={48}
              loadingOverlayComponent={() => (
                <div style={styles.loadingOverlay}>
                  <div style={styles.spinner}></div>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ag-theme-alpine {
          --ag-foreground-color: #1f2937;
          --ag-background-color: #ffffff;
          --ag-header-foreground-color: #1f2937;
          --ag-header-background-color: #ffffff;
          --ag-odd-row-background-color: #ffffff;
          --ag-row-hover-color: #f9fafb;
          --ag-border-color: #e5e7eb;
          --ag-row-border-color: #e5e7eb;
          --ag-font-size: 14px;
          --ag-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --ag-cell-horizontal-padding: 12px;
        }

        .ag-theme-alpine .ag-root-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .ag-theme-alpine .ag-header {
          border-bottom: 1px solid #e5e7eb;
          background-color: #ffffff;
        }

        .ag-theme-alpine .ag-header-cell {
          font-weight: 600;
          font-size: 13px;
          padding-left: 12px;
          padding-right: 12px;
          border-right: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
        }

        /* Keep center header label centered */
        .ag-theme-alpine .ag-header-cell.center-header .ag-header-cell-label {
          justify-content: center;
        }

        .ag-theme-alpine .ag-header-cell-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ag-theme-alpine .ag-cell {
          padding-left: 12px;
          padding-right: 12px;
          line-height: 40px;
          border-right: 1px solid #f3f4f6;
        }

        .ag-theme-alpine .ag-cell-wrapper {
          width: 100%;
          height: 100%;
        }

        /* Slight spacing for the checkbox so icons don't overlap */
        .ag-theme-alpine .ag-selection-checkbox {
          margin-right: 4px;
        }

        .ag-theme-alpine .ag-checkbox {
          padding: 0;
        }

        .ag-theme-alpine .ag-row {
          border-bottom: 1px solid #e5e7eb;
        }

        .ag-theme-alpine .ag-row-selected {
          background-color: #eff6ff !important;
        }

        .ag-theme-alpine .ag-row-selected:hover {
          background-color: #dbeafe !important;
        }

        .ag-theme-alpine .ag-checkbox-input-wrapper {
          width: 18px;
          height: 18px;
        }

        .ag-theme-alpine .ag-checkbox-input-wrapper input {
          width: 16px;
          height: 16px;
          margin: 0;
        }

        .ag-theme-alpine .ag-checkbox-input-wrapper::after {
          display: none;
        }

        .ag-theme-alpine .ag-icon-filter {
          color: #9ca3af;
        }

        .ag-theme-alpine .ag-header-cell-filtered .ag-icon-filter {
          color: #3b82f6;
        }

        .ag-theme-alpine .ag-icon-menu {
          color: #9ca3af;
        }

        .ag-theme-alpine .ag-header-cell:hover .ag-icon-menu {
          color: #6b7280;
        }

        .ag-theme-alpine .ag-header-cell-resize {
          cursor: col-resize;
          width: 4px;
        }

        .ag-theme-alpine .ag-header-cell-resize::after {
          background-color: #d1d5db;
        }

        .ag-theme-alpine .ag-header-cell-resize:hover::after {
          background-color: #3b82f6;
        }

        .ag-theme-alpine .ag-paging-panel {
          border-top: 1px solid #e5e7eb;
          padding: 12px 16px;
          font-size: 13px;
          color: #6b7280;
          background-color: #ffffff;
          height: 56px;
          display: flex;
          align-items: center;
        }

        .ag-theme-alpine .ag-paging-button {
          color: #374151;
          margin: 0 4px;
        }

        .ag-theme-alpine .ag-paging-button:disabled {
          color: #d1d5db;
        }

        .ag-theme-alpine .ag-icon {
          font-size: 16px;
        }

        .ag-theme-alpine .ag-pinned-left-header,
        .ag-theme-alpine .ag-pinned-left-cols-container {
          border-right: 2px solid #e5e7eb;
        }

        /* FIX: hide header icons (menu/filter) for the checkbox column so they don't overlap */
        .ag-theme-alpine .ag-header-cell.checkbox-header .ag-header-cell-menu-button,
        .ag-theme-alpine .ag-header-cell.checkbox-header .ag-header-icon {
          display: none !important;
        }

        /* Extra padding to header labels so icons in other columns have room */
        .ag-theme-alpine .ag-header-cell .ag-header-cell-label {
          padding-right: 20px;
        }

        /* Prevent the filter popup from overlapping pinned columns by giving pinned area higher z-index */
        .ag-theme-alpine .ag-pinned-left-cols-container,
        .ag-theme-alpine .ag-pinned-left-header {
          z-index: 5;
        }

        /* Ensure the header icons are positioned correctly (avoid overlay on pinned area) */
        .ag-theme-alpine .ag-header-cell .ag-header-icon {
          position: relative;
          right: 0;
        }

        /* small tweak to header checkbox alignment */
        .ag-theme-alpine .ag-header-cell.checkbox-header .ag-checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    display: "flex",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  sidebar: {
    width: "72px",
    backgroundColor: "#1e293b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 0",
    position: "fixed",
    height: "100vh",
    left: 0,
    top: 0,
    zIndex: 1000,
  },
  menuButton: {
    width: "48px",
    height: "48px",
    backgroundColor: "#3b82f6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  mainContent: {
    marginLeft: "72px",
    padding: "24px",
    flex: 1,
    minHeight: "100vh",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    gap: "16px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "16px",
    color: "#6b7280",
    margin: 0,
  },
  loadingOverlay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  header: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px 32px",
    marginBottom: "16px",
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  downloadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  statsBar: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "16px 32px",
    marginBottom: "16px",
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
  },
  stats: {
    display: "flex",
    gap: "32px",
  },
  statItem: {
    fontSize: "14px",
    color: "#6b7280",
  },
  gridContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e5e7eb",
  },
  grid: {
    height: "calc(100vh - 280px)",
    minHeight: "500px",
    width: "100%",
  },
};

export default App;
