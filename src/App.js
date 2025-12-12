import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { Search, Download, Menu } from "lucide-react";
import Papa from "papaparse";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const App = () => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCount, setSelectedCount] = useState(0);
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
            console.log("Data loaded:", results.data.length, "rows");
            setRowData(results.data);
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
        field: "track_name",
        headerName: "Track Name",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        minWidth: 250,
        flex: 2,
        filter: "agTextColumnFilter",
        floatingFilter: true,
      },
      {
        field: "track_artist",
        headerName: "Artist",
        minWidth: 200,
        flex: 1.5,
        filter: "agTextColumnFilter",
        floatingFilter: true,
      },
      {
        field: "track_album_name",
        headerName: "Album",
        minWidth: 200,
        flex: 1.5,
        filter: "agTextColumnFilter",
        floatingFilter: true,
      },
      {
        field: "track_popularity",
        headerName: "Popularity",
        width: 130,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
      },
      {
        field: "playlist_genre",
        headerName: "Genre",
        width: 140,
        filter: "agSetColumnFilter",
        floatingFilter: true,
      },
      {
        field: "playlist_subgenre",
        headerName: "Subgenre",
        width: 160,
        filter: "agSetColumnFilter",
        floatingFilter: true,
      },
      {
        field: "danceability",
        headerName: "Danceability",
        width: 140,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        valueFormatter: (params) =>
          params.value ? parseFloat(params.value).toFixed(3) : "",
      },
      {
        field: "energy",
        headerName: "Energy",
        width: 120,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        valueFormatter: (params) =>
          params.value ? parseFloat(params.value).toFixed(3) : "",
      },
      {
        field: "valence",
        headerName: "Valence",
        width: 120,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        valueFormatter: (params) =>
          params.value ? parseFloat(params.value).toFixed(3) : "",
      },
      {
        field: "tempo",
        headerName: "Tempo",
        width: 110,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        valueFormatter: (params) =>
          params.value ? parseFloat(params.value).toFixed(1) : "",
      },
      {
        field: "duration_ms",
        headerName: "Duration (ms)",
        width: 140,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
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
    }),
    []
  );

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (gridRef.current?.api) {
        gridRef.current.api.setGridOption("quickFilterText", searchTerm);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Handle grid ready
  const onGridReady = useCallback((params) => {
    gridRef.current = params;
  }, []);

  // Handle selection change
  const onSelectionChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const selectedRows = gridRef.current.api.getSelectedRows();
      setSelectedCount(selectedRows.length);
    }
  }, []);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: "spotify_tracks_export.csv",
        columnKeys: columnDefs.map((col) => col.field),
      });
    }
  }, [columnDefs]);

  // Get displayed row count
  const getDisplayedRowCount = useCallback(() => {
    if (gridRef.current?.api) {
      return gridRef.current.api.getDisplayedRowCount();
    }
    return 0;
  }, []);

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
            {/* <button style={styles.actionButton}>Action</button> */}
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.searchContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.stats}>
            <span style={styles.statItem}>
              <strong>Total:</strong> {rowData.length.toLocaleString()}
            </span>
            <span style={styles.statItem}>
              <strong>Displayed:</strong> {getDisplayedRowCount()}
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
              animateRows={true}
              enableCellTextSelection={true}
              suppressMenuHide={true}
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
          --ag-header-height: 48px;
          --ag-header-foreground-color: #374151;
          --ag-header-background-color: #f9fafb;
          --ag-odd-row-background-color: #ffffff;
          --ag-row-hover-color: #f3f4f6;
          --ag-border-color: #e5e7eb;
          --ag-font-size: 14px;
          --ag-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --ag-row-border-color: #f3f4f6;
        }

        .ag-theme-alpine .ag-header-cell {
          font-weight: 600;
          padding-left: 16px;
          padding-right: 16px;
        }

        .ag-theme-alpine .ag-cell {
          padding-left: 16px;
          padding-right: 16px;
          line-height: 1.5;
        }

        .ag-theme-alpine .ag-root-wrapper {
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }

        .ag-theme-alpine .ag-paging-panel {
          border-top: 1px solid #e5e7eb;
          padding: 16px;
          font-size: 14px;
          color: #6b7280;
        }

        .ag-theme-alpine .ag-paging-button {
          color: #374151;
        }

        .ag-theme-alpine .ag-floating-filter-input {
          font-size: 13px;
          padding: 6px 8px;
        }

        .ag-theme-alpine .ag-header-cell-label {
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
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
    backgroundColor: "#f8f9fa",
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
    borderRadius: "12px",
    padding: "24px 32px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  actionButton: {
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  controls: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px 32px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchContainer: {
    position: "relative",
    flex: 1,
    minWidth: "300px",
    maxWidth: "500px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 40px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  stats: {
    display: "flex",
    gap: "24px",
    marginLeft: "auto",
  },
  statItem: {
    fontSize: "14px",
    color: "#6b7280",
  },
  gridContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  grid: {
    height: "calc(100vh - 340px)",
    minHeight: "500px",
    width: "100%",
  },
};

export default App;
