import { useState, useEffect } from "react";
import { API_URL } from "../../config/config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageAvatar from "../../components/Avatar/ImageAvatar";
import ImageCover from "../../components/Avatar/coverImages";
import { 
  Button, 
  Card, 
  Spin, 
  Alert, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Badge,
  Divider,
  Avatar,
  Progress
} from "antd";
import { 
  ShopOutlined, 
  UsergroupAddOutlined, 
  TeamOutlined, 
  ShoppingOutlined, 
  PlusOutlined,
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  RightOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const ShopPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const [myshop, setMyshop] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getmyshop = async () => {
    if (!token || !userId) {
      setError("กรุณาล็อกอินเพื่อดูร้านค้าของคุณ");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/shop/getmyshop`,
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response.data);
      if (response.data?.code === 1000) {
        setMyshop(response.data?.datarow || []);
      } else {
        setError(
          "ไม่สามารถดึงข้อมูลร้านค้าได้: " +
            (response.data?.message || "ข้อผิดพลาดไม่ทราบสาเหตุ")
        );
      }
    } catch (error) {
      console.error(
        "Error fetching shops:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.status === 401
          ? "เซสชันหมดอายุ กรุณาล็อกอินใหม่"
          : "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์: " +
            (error.response?.data?.message || error.message);
      setError(errorMessage);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createshop = () => {
    navigate("/shopcreate");
  };

  const gotomyshop = (item) => {
    console.log("Navigating to shop manage:", item);
    navigate(`/shopmanage/${item.id}`);
  };

  useEffect(() => {
    getmyshop();
  }, []);

  // Calculate shop performance score
  const calculateShopScore = (shop) => {
    const customers = shop.customer_count || 0;
    const employees = shop.employee_count || 0;
    const reorders = shop.products_to_reorder || 0;
    
    // Simple scoring algorithm
    const score = Math.min(100, (customers * 2) + (employees * 5) + Math.max(0, 20 - reorders));
    return Math.max(0, score);
  };

  const getShopBadge = (score) => {
    if (score >= 80) return { text: "ดาวเด่น", color: "gold", icon: <StarOutlined /> };
    if (score >= 60) return { text: "ได้รับความนิยม", color: "orange", icon: <FireOutlined /> };
    if (score >= 40) return { text: "กำลังเติบโต", color: "blue", icon: <TrophyOutlined /> };
    return { text: "เริ่มต้น", color: "green", icon: <ShopOutlined /> };
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
          
          .sarabun-font {
            font-family: 'Sarabun', sans-serif !important;
          }
          .sarabun-font * {
            font-family: 'Sarabun', sans-serif !important;
          }
          
          .header-section {
            background: #ffffff;
            padding: 32px;
            border-radius: 16px;
            margin-bottom: 24px;
            border: 1px solid #e8e8e8;
          }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .shop-card {
            transition: all 0.3s ease;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #f0f0f0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }
          
          .shop-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
            border-color: #1890ff;
          }
          
          .shop-card .ant-card-cover {
            position: relative;
            overflow: hidden;
          }
          
          .avatar-container {
            position: relative;
            display: inline-block;
            margin-top: -32px;
            z-index: 2;
          }
          
          .avatar-ring {
            border: 4px solid white;
            border-radius: 50%;
            overflow: hidden;
            width: 80px;
            height: 80px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 16px;
          }
          
          .stat-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            transition: all 0.2s ease;
          }
          
          .stat-item:hover {
            background: #e9ecef;
            transform: scale(1.02);
          }
          
          .stat-number {
            font-size: 20px;
            font-weight: 600;
            color: #1890ff;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #666;
          }
          
          .empty-state {
            text-align: center;
            padding: 48px 24px;
            background: #ffffff;
            border-radius: 16px;
            border: 2px dashed #d9d9d9;
          }
          
          .create-btn {
            background: #1890ff;
            border: none;
            border-radius: 8px;
            height: 48px;
            font-weight: 500;
            box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
          }
          
          .create-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
          }
          
          .performance-bar {
            margin-top: 8px;
          }
        `}
      </style>
      
      <div className="flex-1 p-6 bg-gray-50 min-h-screen sarabun-font">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="header-section">
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={1} style={{ color: '#333', margin: 0, fontSize: '2.5rem' }}>
                  <ShopOutlined style={{ marginRight: 16 }} />
                  ร้านค้าของคุณ
                </Title>
                <Paragraph style={{ color: '#666', fontSize: '18px', margin: '8px 0 0' }}>
                  จัดการและติดตามประสิทธิภาพร้านค้าของคุณ
                </Paragraph>
              </Col>
              <Col>
                <Button
                  className="create-btn"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={createshop}
                  size="large"
                  style={{ minWidth: 160 }}
                >
                  {myshop.length > 0 ? "เพิ่มร้านใหม่" : "สร้างร้านแรก"}
                </Button>
              </Col>
            </Row>
          </div>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Error Message */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ borderRadius: 12 }}
                action={
                  <Button size="small" danger onClick={() => getmyshop()}>
                    ลองใหม่
                  </Button>
                }
                closable
                onClose={() => setError(null)}
              />
            )}

            {/* Loading State */}
            {isLoading && (
              <Card className="glass-card" style={{ borderRadius: 16, textAlign: 'center', padding: '48px 24px' }}>
                <Spin size="large" />
                <Title level={4} style={{ marginTop: 16, color: '#666' }}>
                  กำลังโหลดข้อมูลร้านค้า...
                </Title>
              </Card>
            )}

            {/* Shop List */}
            {!isLoading && myshop.length > 0 ? (
              <>
                <Title level={3} style={{ color: '#333', marginBottom: 24 }}>
                  ร้านค้าทั้งหมด ({myshop.length} ร้าน)
                </Title>
                <Row gutter={[24, 24]}>
                  {myshop.map((item, index) => {
                    const score = calculateShopScore(item);
                    const badge = getShopBadge(score);
                    
                    return (
                      <Col xs={24} sm={12} lg={8} key={item.id || index}>
                        <Card
                          className="shop-card"
                          hoverable
                          onClick={() => gotomyshop(item)}
                          cover={
                            <div style={{ position: 'relative', height: 160 }}>
                              {item.cover ? (
                                <ImageCover
                                  name={`${item.shop_name} cover`}
                                  url={`${API_URL}/files/uploads/${item.cover}`}
                                  style={{ 
                                    width: '100%',
                                    height: '100%', 
                                    objectFit: "cover" 
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    height: '100%',
                                    background: "#f5f5f5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: '#999',
                                    fontSize: '18px'
                                  }}
                                >
                                  <ShopOutlined style={{ fontSize: '48px' }} />
                                </div>
                              )}
                              
                              {/* Shop Badge */}
                              <Badge
                                count={badge.text}
                                style={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12,
                                  backgroundColor: badge.color,
                                  color: 'white',
                                  borderRadius: '12px',
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  fontWeight: 500
                                }}
                              />
                            </div>
                          }
                        >
                          {/* Avatar Section */}
                          <div style={{ textAlign: "center" }}>
                            <div className="avatar-container">
                              <div className="avatar-ring">
                                {item.avatar ? (
                                  <ImageAvatar
                                    name={`${item.shop_name} avatar`}
                                    url={`${API_URL}/files/uploads/${item.avatar}`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <Avatar
                                    size={72}
                                    style={{
                                      backgroundColor: '#1890ff',
                                      fontSize: '24px'
                                    }}
                                    icon={<ShopOutlined />}
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Shop Info */}
                          <div style={{ textAlign: "center", marginTop: 16 }}>
                            <Title level={4} style={{ margin: '0 0 8px', color: '#333' }}>
                              {item.shop_name || "Unnamed Shop"}
                            </Title>
                            
                            {/* Performance Score */}
                            <div style={{ marginBottom: 16 }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                คะแนนประสิทธิภาพ
                              </Text>
                              <Progress
                                percent={score}
                                size="small"
                                strokeColor="#1890ff"
                                className="performance-bar"
                              />
                            </div>
                          </div>

                          <Divider style={{ margin: '16px 0' }} />

                          {/* Statistics Grid */}
                          <div className="stats-grid">
                            <div className="stat-item">
                              <div className="stat-number">
                                <UsergroupAddOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                {item.customer_count || 0}
                              </div>
                              <div className="stat-label">ลูกค้า</div>
                            </div>
                            
                            <div className="stat-item">
                              <div className="stat-number">
                                <TeamOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                                {item.employee_count || 0}
                              </div>
                              <div className="stat-label">พนักงาน</div>
                            </div>
                            
                            <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                              <div className="stat-number">
                                <ShoppingOutlined style={{ marginRight: 4, color: '#fa8c16' }} />
                                {item.products_to_reorder || 0}
                              </div>
                              <div className="stat-label">สินค้าต้องสั่งเพิ่ม</div>
                            </div>
                          </div>

                          {/* Action Area */}
                          <div style={{ 
                            marginTop: 16, 
                            padding: '12px 16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Text strong style={{ color: '#1890ff' }}>
                              จัดการร้านค้า
                            </Text>
                            <RightOutlined style={{ color: '#1890ff' }} />
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </>
            ) : (
              !isLoading && (
                <div className="empty-state">
                  <div style={{ marginBottom: 24 }}>
                    <ShopOutlined style={{ fontSize: '72px', color: '#d9d9d9' }} />
                  </div>
                  <Title level={3} style={{ color: '#666', marginBottom: 16 }}>
                    ยังไม่มีร้านค้า
                  </Title>
                  <Paragraph style={{ fontSize: '16px', color: '#999', marginBottom: 32 }}>
                    เริ่มต้นสร้างร้านค้าแรกของคุณและเปิดโอกาสทางธุรกิจใหม่ๆ
                  </Paragraph>
                  <Button 
                    className="create-btn"
                    type="primary" 
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={createshop}
                  >
                    สร้างร้านค้าแรก
                  </Button>
                </div>
              )
            )}
          </Space>
        </div>
      </div>
    </>
  );
};

export default ShopPage;