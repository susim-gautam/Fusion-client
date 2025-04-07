import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  Title,
  Box,
  Grid,
  Text,
  Badge,
  Divider,
  Anchor,
  NumberInput,
  FileInput,
  Group,
  TextInput,
  Textarea,
  Table,
} from "@mantine/core";
import {
  Pencil,
  FloppyDisk,
  Trash,
  PaperPlaneRight,
  ArrowBendUpRight,
  XCircle,
  CheckCircle,
  FileArchive,
  FileText,
  Table as TableIcon,
  User,
  Tag,
  IdentificationCard,
  Building,
  Calendar,
  ClipboardText,
  UserList,
} from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import HrBreadcrumbs from "../../components/HrBreadcrumbs";
import LoadingComponent from "../../components/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import SearchAndSelectUser from "../../components/SearchAndSelectUser";
import {
  get_leave_form_by_id,
  download_leave_form_pdf,
} from "../../../../routes/hr";
import "./LeaveFormView.css";

const LeaveFormView = () => {
  const { id } = useParams();
  const [fetchedformData, setFetchedFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const admin = new URLSearchParams(window.location.search).get("admin");
  const [exampleItems, setExampleItems] = useState([]);

  // State for editable mode
  const [isEditable, setIsEditable] = useState(false);

  // State for editable fields
  const [editedStationLeave, setEditedStationLeave] = useState({
    stationLeave: false,
    stationLeaveStartDate: "",
    stationLeaveEndDate: "",
    stationLeaveAddress: "",
  });
  const [file, setFile] = useState(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userList, setUserList] = useState([]);

  // State for all editable leave balances
  const [editedBalances, setEditedBalances] = useState({
    casualLeave: 0,
    vacationLeave: 0,
    earnedLeave: 0,
    commutedLeave: 0,
    specialCasualLeave: 0,
    restrictedHoliday: 0,
    halfPayLeave: 0,
    maternityLeave: 0,
    childCareLeave: 0,
    paternityLeave: 0,
  });

  useEffect(() => {
    if (admin) {
      setExampleItems([
        { title: "Home", path: "/dashboard" },
        { title: "Human Resources", path: "/hr" },
        { title: "Admin Leave Management", path: "/hr/admin_leave" },
        {
          title: "Leave Requests",
          path: "/hr/admin_leave/review_leave_requests",
        },
        { title: "View Form", path: `/hr/leave/view/${id}?admin=true` },
      ]);
    } else {
      setExampleItems([
        { title: "Home", path: "/dashboard" },
        { title: "Human Resources", path: "/hr" },
        { title: "Leave", path: "/hr/leave" },
        { title: "View Form", path: `/hr/leave/view/${id}` },
      ]);
    }
  }, [admin]);

  // Initialize all editable fields when data is fetched
  useEffect(() => {
    if (fetchedformData) {
      setEditedBalances({
        casualLeave: fetchedformData.casualLeave || 0,
        vacationLeave: fetchedformData.vacationLeave || 0,
        earnedLeave: fetchedformData.earnedLeave || 0,
        commutedLeave: fetchedformData.commutedLeave || 0,
        specialCasualLeave: fetchedformData.specialCasualLeave || 0,
        restrictedHoliday: fetchedformData.restrictedHoliday || 0,
        halfPayLeave: fetchedformData.halfPayLeave || 0,
        maternityLeave: fetchedformData.maternityLeave || 0,
        childCareLeave: fetchedformData.childCareLeave || 0,
        paternityLeave: fetchedformData.paternityLeave || 0,
      });

      setEditedStationLeave({
        stationLeave: fetchedformData.stationLeave || false,
        stationLeaveStartDate: fetchedformData.stationLeaveStartDate || "",
        stationLeaveEndDate: fetchedformData.stationLeaveEndDate || "",
        stationLeaveAddress: fetchedformData.stationLeaveAddress || "",
      });
    }
  }, [fetchedformData]);

  const handleBalanceChange = (fieldName, value) => {
    setEditedBalances((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleStationLeaveChange = (field, value) => {
    setEditedStationLeave((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (file) => {
    setFile(file);
    if (file) {
      setRemoveExistingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setRemoveExistingFile(true);
    setFile(null);
  };

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleCancelEdit = () => {
    setIsEditable(false);
    // Reset to original values
    if (fetchedformData) {
      setEditedBalances({
        casualLeave: fetchedformData.casualLeave || 0,
        vacationLeave: fetchedformData.vacationLeave || 0,
        earnedLeave: fetchedformData.earnedLeave || 0,
        commutedLeave: fetchedformData.commutedLeave || 0,
        specialCasualLeave: fetchedformData.specialCasualLeave || 0,
        restrictedHoliday: fetchedformData.restrictedHoliday || 0,
        halfPayLeave: fetchedformData.halfPayLeave || 0,
        maternityLeave: fetchedformData.maternityLeave || 0,
        childCareLeave: fetchedformData.childCareLeave || 0,
        paternityLeave: fetchedformData.paternityLeave || 0,
      });

      setEditedStationLeave({
        stationLeave: fetchedformData.stationLeave || false,
        stationLeaveStartDate: fetchedformData.stationLeaveStartDate || "",
        stationLeaveEndDate: fetchedformData.stationLeaveEndDate || "",
        stationLeaveAddress: fetchedformData.stationLeaveAddress || "",
      });

      setFile(null);
      setRemoveExistingFile(false);
    }
  };

  const handleUpdateAndForward = async () => {
    try {
      if (!selectedUser) {
        alert("Please select a user to forward the form to");
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        return;
      }

      // Prepare form data for submission
      const formData = new FormData();
      formData.append("casualLeave", editedBalances.casualLeave);
      formData.append("vacationLeave", editedBalances.vacationLeave);
      formData.append("earnedLeave", editedBalances.earnedLeave);
      formData.append("commutedLeave", editedBalances.commutedLeave);
      formData.append("specialCasualLeave", editedBalances.specialCasualLeave);
      formData.append("restrictedHoliday", editedBalances.restrictedHoliday);
      formData.append("halfPayLeave", editedBalances.halfPayLeave);
      formData.append("maternityLeave", editedBalances.maternityLeave);
      formData.append("childCareLeave", editedBalances.childCareLeave);
      formData.append("paternityLeave", editedBalances.paternityLeave);

      formData.append("stationLeave", editedStationLeave.stationLeave);
      formData.append(
        "stationLeaveStartDate",
        editedStationLeave.stationLeaveStartDate,
      );
      formData.append(
        "stationLeaveEndDate",
        editedStationLeave.stationLeaveEndDate,
      );
      formData.append(
        "stationLeaveAddress",
        editedStationLeave.stationLeaveAddress,
      );

      if (file) {
        formData.append("file", file);
      }
      formData.append("removeExistingFile", removeExistingFile);
      formData.append("forwardTo", selectedUser);

      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/leave_forms/${id}/update/`, {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update leave form");
      }

      const data = await response.json();
      console.log("Update successful:", data);
      setIsEditable(false);
      // Optionally refresh the data
      fetchFormData();
    } catch (error) {
      console.error("Error updating leave form:", error);
    }
  };

  const fetchFormData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${get_leave_form_by_id}/${id}`, {
        headers: { Authorization: `Token ${token}` },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // Adjust status for null responsibilities
      const adjustedData = {
        ...data.leave_form,
        academicResponsibilityStatus: data.leave_form.academicResponsibility
          ? data.leave_form.academicResponsibilityStatus
          : "Accepted",
        administrativeResponsibilityStatus: data.leave_form
          .administrativeResponsibility
          ? data.leave_form.administrativeResponsibilityStatus
          : "Accepted",
      };
      setFetchedFormData(adjustedData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch form data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, [id]);

  const handleDownloadPdf = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found!");
      return;
    }

    try {
      const response = await fetch(`${download_leave_form_pdf}/${id}`, {
        headers: { Authorization: `Token ${token}` },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fetchedformData.attachedPdfName;
      a.click();
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found!");
          return;
        }

        const response = await fetch("/api/users/", {
          headers: { Authorization: `Token ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        const formattedUsers = data.map((user) => ({
          value: user.id,
          label: `${user.name} (${user.designation})`,
        }));
        setUserList(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (isEditable) {
      fetchUsers();
    }
  }, [isEditable]);

  if (loading) {
    return <LoadingComponent />;
  }

  if (!fetchedformData) {
    return (
      <>
        <HrBreadcrumbs items={exampleItems} />
        <EmptyTable message="No view data found." />
      </>
    );
  }

  // Leave balances table data
  const leaveBalances = [
    {
      type: "Casual Leave",
      balance: fetchedformData.casualLeaveBalance,
      applied: editedBalances.casualLeave,
    },
    {
      type: "Special Casual Leave",
      balance: fetchedformData.special_casual_leaveBalance,
      applied: editedBalances.specialCasualLeave,
    },
    {
      type: "Earned Leave",
      balance: fetchedformData.earned_leaveBalance,
      applied: editedBalances.earnedLeave,
    },
    {
      type: "Half Pay Leave",
      balance: fetchedformData.half_pay_leaveBalance,
      applied: editedBalances.halfPayLeave,
    },
    {
      type: "Maternity Leave",
      balance: fetchedformData.maternity_leaveBalance,
      applied: editedBalances.maternityLeave,
    },
    {
      type: "Child Care Leave",
      balance: fetchedformData.child_care_leaveBalance,
      applied: editedBalances.childCareLeave,
    },
    {
      type: "Paternity Leave",
      balance: fetchedformData.paternity_leaveBalance,
      applied: editedBalances.paternityLeave,
    },
  ].map((leave) => {
    const balance = parseFloat(leave.balance) || 0;
    return {
      ...leave,
      balance: balance,
    };
  });

  const leaveApplications = [
    {
      type: "Casual Leave",
      applied: editedBalances.casualLeave,
    },
    {
      type: "Vacation Leave",
      applied: editedBalances.vacationLeave,
    },
    {
      type: "Earned Leave",
      applied: editedBalances.earnedLeave,
    },
    {
      type: "Commuted Leave",
      applied: editedBalances.commutedLeave,
    },
    {
      type: "Special Casual Leave",
      applied: editedBalances.specialCasualLeave,
    },
    {
      type: "Restricted Holiday",
      applied: editedBalances.restrictedHoliday,
    },
    {
      type: "Half Pay Leave",
      applied: editedBalances.halfPayLeave,
    },
    {
      type: "Maternity Leave",
      applied: editedBalances.maternityLeave,
    },
    {
      type: "Child Care Leave",
      applied: editedBalances.childCareLeave,
    },
    {
      type: "Paternity Leave",
      applied: editedBalances.paternityLeave,
    },
  ];

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      <Box
        style={{
          padding: "25px 30px",
          margin: "20px 5px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        {/* In the Group position="apart" section where the title is */}

        <Group position="apart" mb="md">
          <Title order={2} style={{ fontWeight: "500" }}>
            Leave Form Details
          </Title>

          {/* Changed this to always show the edit button for testing */}
          {!isEditable && (
            <Button
              leftIcon={<Pencil size={18} />}
              onClick={handleEditClick}
              variant="outline"
            >
              Edit
            </Button>
          )}
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Text>
              <strong>Status:</strong>{" "}
              <Badge
                color={
                  fetchedformData.status === "Accepted"
                    ? "green"
                    : fetchedformData.status === "Rejected"
                      ? "red"
                      : "yellow"
                }
              >
                {fetchedformData.status}
              </Badge>
            </Text>
          </Grid.Col>

          {fetchedformData.academicResponsibilityStatus === "Accepted" &&
            fetchedformData.administrativeResponsibilityStatus ===
              "Accepted" && (
              <Grid.Col
                span={6}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    if (admin) {
                      navigate(
                        `../FormView/leaveform_track/${fetchedformData.file_id}?admin=true`,
                      );
                    } else {
                      navigate(
                        `../FormView/leaveform_track/${fetchedformData.file_id}`,
                      );
                    }
                  }}
                >
                  Track Status
                </Button>
              </Grid.Col>
            )}
        </Grid>

        <Box
          sx={{
            maxWidth: "850px",
            margin: "auto",
            padding: "30px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {/* Employee Details (non-editable) */}
          <Title order={4} style={{ marginTop: "30px" }}>
            Employee Details
          </Title>
          <Divider my="sm" />
          <Grid gutter="lg" style={{ padding: "0 20px" }}>
            <Grid.Col span={6}>
              <Text>
                <strong>Name:</strong> {fetchedformData.name}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Designation:</strong> {fetchedformData.designation}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Personal File Number:</strong> {fetchedformData.pfno}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Department:</strong> {fetchedformData.department}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Application Type:</strong>{" "}
                <Badge
                  color={
                    fetchedformData.application_type === "Online"
                      ? "blue"
                      : "green"
                  }
                >
                  {fetchedformData.application_type}
                </Badge>
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Submission Date:</strong>{" "}
                {fetchedformData.submissionDate}
              </Text>
            </Grid.Col>
          </Grid>

          {/* Leave Details (non-editable) */}
          <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
            Leave Details
          </Title>
          <Divider my="sm" />
          <Grid gutter="lg" style={{ padding: "0 20px" }}>
            <Grid.Col span={6}>
              <Text>
                <strong>Leave Start Date:</strong>{" "}
                {fetchedformData.leaveStartDate}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <strong>Leave End Date:</strong> {fetchedformData.leaveEndDate}
              </Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text>
                <strong>Purpose of Leave:</strong> {fetchedformData.purpose}
              </Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text>
                <strong>Remarks:</strong> {fetchedformData.remarks}
              </Text>
            </Grid.Col>
          </Grid>

          {/* Leave Types and Balances Section */}
          <Title order={4} mt="xl">
            Leave Types and Balances
          </Title>
          <Divider my="sm" />
          <Grid gutter="xl">
            <Grid.Col
              span={6}
              style={{ borderRight: "1px solid #ccc", paddingRight: "24px" }}
            >
              <Title order={5} mb="sm" style={{ textAlign: "center" }}>
                Leave Types Applied
              </Title>
              <Table>
                <thead>
                  <tr style={{ backgroundColor: "#e9ecef" }}>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      Leave Type
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      Days Applied
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaveApplications.map((leave, index) => (
                    <tr
                      key={`applied-${index}`}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#e8e8e8",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          textAlign: "left",
                        }}
                      >
                        {leave.type}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          textAlign: "center",
                          fontWeight: leave.applied > 0 ? "bold" : "normal",
                        }}
                      >
                        {leave.applied || "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Grid.Col>

            <Grid.Col span={6} style={{ paddingLeft: "24px" }}>
              <Title order={5} mb="sm" style={{ textAlign: "center" }}>
                All Leave Balances
              </Title>
              <Table>
                <thead>
                  <tr style={{ backgroundColor: "#e9ecef" }}>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      Leave Type
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ccc",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      Balance (Days)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaveBalances.map((leave, index) => {
                    const balance = parseFloat(leave.balance) || 0;
                    const isNegative = balance < 0;
                    const isPositive = balance > 0;

                    return (
                      <tr
                        key={`balance-${index}`}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#ffffff" : "#e8e8e8",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            textAlign: "left",
                          }}
                        >
                          {leave.type}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            textAlign: "center",
                            color: isNegative
                              ? "#ff0000"
                              : isPositive
                                ? "#28a745"
                                : "inherit",
                            fontWeight:
                              isNegative || isPositive ? "bold" : "normal",
                          }}
                        >
                          {leave.balance || "0"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Grid.Col>
          </Grid>

          {/* Station Leave Section */}
          <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
            Station Leave Details
          </Title>
          <Divider my="sm" />
          {isEditable ? (
            <>
              <Grid gutter="lg" style={{ padding: "0 20px" }}>
                <Grid.Col span={12}>
                  <Select
                    label="Station Leave"
                    value={editedStationLeave.stationLeave ? "yes" : "no"}
                    onChange={(value) =>
                      handleStationLeaveChange("stationLeave", value === "yes")
                    }
                    data={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                </Grid.Col>

                {editedStationLeave.stationLeave && (
                  <>
                    <Grid.Col span={6}>
                      <TextInput
                        label="Station Leave Start Date"
                        value={editedStationLeave.stationLeaveStartDate}
                        onChange={(e) =>
                          handleStationLeaveChange(
                            "stationLeaveStartDate",
                            e.target.value,
                          )
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput
                        label="Station Leave End Date"
                        value={editedStationLeave.stationLeaveEndDate}
                        onChange={(e) =>
                          handleStationLeaveChange(
                            "stationLeaveEndDate",
                            e.target.value,
                          )
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Textarea
                        label="Address During Station Leave"
                        value={editedStationLeave.stationLeaveAddress}
                        onChange={(e) =>
                          handleStationLeaveChange(
                            "stationLeaveAddress",
                            e.target.value,
                          )
                        }
                      />
                    </Grid.Col>
                  </>
                )}
              </Grid>
            </>
          ) : (
            fetchedformData.stationLeave && (
              <Grid gutter="lg" style={{ padding: "0 20px" }}>
                <Grid.Col span={6}>
                  <Text>
                    <strong>Station Leave Start Date:</strong>{" "}
                    {fetchedformData.stationLeaveStartDate}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text>
                    <strong>Station Leave End Date:</strong>{" "}
                    {fetchedformData.stationLeaveEndDate}
                  </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text>
                    <strong>Address During Station Leave:</strong>{" "}
                    {fetchedformData.stationLeaveAddress}
                  </Text>
                </Grid.Col>
              </Grid>
            )
          )}

          {/* Responsibility Transfer (non-editable) */}
          {(fetchedformData.academicResponsibility ||
            fetchedformData.administrativeResponsibility) && (
            <>
              <Title order={4} mt="xl" style={{ marginTop: "30px" }}>
                Responsibility Transfer
              </Title>
              <Divider my="sm" />
              <Grid gutter="lg" style={{ padding: "0 20px" }}>
                {fetchedformData.academicResponsibility && (
                  <Grid.Col span={6}>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Academic Responsibility:</strong>{" "}
                      {fetchedformData.academicResponsibility}
                    </Text>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Academic Responsibility Designation:</strong>{" "}
                      {fetchedformData.academicResponsibilityDesignation}
                    </Text>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Academic Responsibility Status:</strong>{" "}
                      <Badge
                        color={
                          fetchedformData.academicResponsibilityStatus ===
                          "Accepted"
                            ? "green"
                            : fetchedformData.academicResponsibilityStatus ===
                                "Rejected"
                              ? "red"
                              : "yellow"
                        }
                      >
                        {fetchedformData.academicResponsibilityStatus}
                      </Badge>
                    </Text>
                  </Grid.Col>
                )}
                {fetchedformData.administrativeResponsibility && (
                  <Grid.Col span={6}>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Administrative Responsibility:</strong>{" "}
                      {fetchedformData.administrativeResponsibility}
                    </Text>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>
                        Administrative Responsibility Designation:
                      </strong>{" "}
                      {fetchedformData.administrativeResponsibilityDesignation}
                    </Text>
                    <Text style={{ marginBottom: "10px" }}>
                      <strong>Administrative Responsibility Status:</strong>{" "}
                      <Badge
                        color={
                          fetchedformData.administrativeResponsibilityStatus ===
                          "Accepted"
                            ? "green"
                            : fetchedformData.administrativeResponsibilityStatus ===
                                "Rejected"
                              ? "red"
                              : "yellow"
                        }
                      >
                        {fetchedformData.administrativeResponsibilityStatus}
                      </Badge>
                    </Text>
                  </Grid.Col>
                )}
              </Grid>
            </>
          )}

          {/* Attachments Section */}
          <Title order={4} mt="xl">
            Attachments
          </Title>
          <Divider my="sm" />
          <Grid gutter="lg" style={{ padding: "0 20px" }}>
            <Grid.Col span={12}>
              {isEditable ? (
                <>
                  {fetchedformData.attachedPdfName && !removeExistingFile && (
                    <Group mb="sm">
                      <Text>
                        <strong>Current File:</strong>{" "}
                        {fetchedformData.attachedPdfName}
                      </Text>
                      <Button
                        variant="outline"
                        color="red"
                        size="xs"
                        leftIcon={<Trash size={14} />}
                        onClick={handleRemoveFile}
                      >
                        Remove
                      </Button>
                    </Group>
                  )}
                  <FileInput
                    label="Upload new file"
                    placeholder="Select file"
                    value={file}
                    onChange={handleFileChange}
                    accept="application/pdf"
                  />
                </>
              ) : (
                <Text>
                  <strong>Attached PDF:</strong>{" "}
                  {fetchedformData.attachedPdfName ? (
                    <Anchor onClick={handleDownloadPdf} download>
                      {fetchedformData.attachedPdfName}
                    </Anchor>
                  ) : (
                    "No file attached"
                  )}
                </Text>
              )}
            </Grid.Col>
          </Grid>

          {/* Action Buttons */}
          {isEditable ? (
            <>
              <Title order={4} mt="xl">
                Forward To
              </Title>
              <Divider my="sm" />
              <Grid gutter="lg" style={{ padding: "0 20px" }}>
                <Grid.Col span={12}>
                  <SearchAndSelectUser
                    onUserSelect={(user) => setSelectedUser(user)}
                  />
                </Grid.Col>
              </Grid>
              <Group position="right" mt="xl">
                <Button
                  variant="outline"
                  color="red"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateAndForward}
                  leftIcon={<FloppyDisk size={18} />}
                >
                  Update and Forward
                </Button>
              </Group>
            </>
          ) : null}

          {/* Forward Application Section (non-editable) */}
          {fetchedformData.status === "Pending" &&
            (fetchedformData.academicResponsibilityStatus === "Pending" ||
              fetchedformData.administrativeResponsibilityStatus ===
                "Pending") && (
              <>
                <Title order={4} style={{ marginTop: "30px" }}>
                  Forward Application
                </Title>
                <Divider my="sm" />
                <Grid gutter="lg" style={{ padding: "0 20px" }}>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Next receiver:</strong>{" "}
                      {fetchedformData.firstRecievedBy}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Next receiver's Designation:</strong>{" "}
                      {fetchedformData.firstRecievedByDesignation}
                    </Text>
                  </Grid.Col>
                </Grid>
              </>
            )}

          {/* Approval Section (non-editable) */}
          {fetchedformData.status === "Accepted" &&
            fetchedformData.approvedBy && (
              <>
                <Title order={4} mt="xl">
                  Approval
                </Title>
                <Divider my="sm" />
                <Grid gutter="lg" style={{ padding: "0 20px" }}>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Approved By:</strong> {fetchedformData.approvedBy}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Designation:</strong>{" "}
                      {fetchedformData.approvedByDesignation}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <strong>Approved Date:</strong>{" "}
                      {fetchedformData.approvedDate}
                    </Text>
                  </Grid.Col>
                </Grid>
              </>
            )}
        </Box>
      </Box>
    </>
  );
};

export default LeaveFormView;
