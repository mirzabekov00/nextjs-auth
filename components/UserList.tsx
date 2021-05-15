import {
  Button,
  Table,
  Typography,
  Modal,
  Input,
  Switch,
  Alert,
  message,
  Space,
  Col,
  Row,
  InputNumber,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import { setDatabase } from "../redux/database-reducer";
import { ReduxDatabase } from "../store";
import { find } from "lodash";
import { HIDE_ERROR_DELAY } from "../constants/constants";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";

interface UserListProps {}

export const UserList: React.FC<UserListProps> = ({}) => {
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const database = useSelector((state: ReduxDatabase) => state.databaseReducer);

  const [minPasswordLength, setMinPasswordLength] = useState<number>(
    database.MIN_PASSWORD_LENGTH
  );

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError("");
      }, HIDE_ERROR_DELAY);
    }
  }, [error]);

  const { users } = database;

  const dispatch = useDispatch();

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.username.length - b.username.length,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      sorter: (a, b) => a.role.length - b.role.length,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Block user",
      key: "action",
      render: (text, record) =>
        record.role !== "admin" ? (
          <Switch
            defaultChecked={record.blocked}
            onChange={(flag) => handleBlockUser(flag, record.id)}
          />
        ) : null,
    },
  ];

  const handleBlockUser = (flag, id) => {
    const newUsers = users.map((user) =>
      user.id === id ? { ...user, blocked: flag } : user
    );

    const newDatabase = {
      ...database,
      users: newUsers,
    };
    dispatch(setDatabase(newDatabase));
  };

  const handleCreateUser = () => {
    const newUser = {
      id: v4(),
      username: newUserName,
      blocked: false,
      role: "user",
      password: "",
    };

    const userAlereadyExists = find(users, { username: newUserName });

    if (userAlereadyExists) {
      return setError("Username already exists");
    }

    const newDatabase = {
      ...database,
      users: [...users, newUser],
    };

    dispatch(setDatabase(newDatabase));
    setVisibleModal(false);
    message.success("User was created");
  };

  return (
    <>
      <Row>
        <Col span={12}>
          <Space align="center" style={{ marginBottom: 15 }}>
            <Typography.Title style={{ marginBottom: 0 }} level={2}>
              User list
            </Typography.Title>
            <Button
              icon={<PlusOutlined />}
              size="large"
              type="primary"
              onClick={() => setVisibleModal(true)}
            >
              Create new user
            </Button>
          </Space>
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <p
            style={{
              marginBottom: 0,
              display: "inline-block",
              fontSize: 16,
              marginRight: 5,
            }}
          >
            Minimal password length for users:
          </p>
          <InputNumber
            size="large"
            placeholder="Minimal password length for users"
            style={{ width: 200 }}
            onChange={(value) => setMinPasswordLength(+value)}
            value={minPasswordLength}
          />
          <Button
            style={{ marginLeft: 5 }}
            size="large"
            icon={<SaveOutlined />}
            disabled={+minPasswordLength === +database.MIN_PASSWORD_LENGTH}
          >
            Save
          </Button>
        </Col>
      </Row>
      <Table rowKey="id" columns={columns} dataSource={users || []} />
      <Modal
        title="Create new user"
        visible={visibleModal}
        onCancel={() => setVisibleModal(false)}
        onOk={handleCreateUser}
      >
        {error && (
          <Alert style={{ marginBottom: 15 }} message={error} type="error" />
        )}
        <div style={{ marginBottom: 5 }}>New user name</div>{" "}
        <Input
          autoFocus
          onPressEnter={handleCreateUser}
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
        />
      </Modal>
    </>
  );
};
