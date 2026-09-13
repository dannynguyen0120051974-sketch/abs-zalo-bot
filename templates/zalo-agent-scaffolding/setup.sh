#!/usr/bin/env bash
set -euo pipefail

# Setup 5-Layer Agent Scaffolding for Hermes Profile
# Usage: ./setup.sh [profile_name]
# Example: ./setup.sh zalo-assistant

PROFILE_NAME="${1:-zalo-assistant}"
HERMES_DIR="${HOME}/.hermes"
TARGET_PROFILE_DIR="${HERMES_DIR}/profiles/${PROFILE_NAME}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 [ABS Zalo Bot] Khởi tạo 5 Lớp Scaffolding cho Hermes Profile: ${PROFILE_NAME}"
echo "📁 Thư mục đích: ${TARGET_PROFILE_DIR}"

mkdir -p "${TARGET_PROFILE_DIR}"

# 1. Soul
cp "${SCRIPT_DIR}/template_soul.md" "${TARGET_PROFILE_DIR}/SOUL.md"
# 2. Persona & Style Guide
cp "${SCRIPT_DIR}/template_persona.md" "${TARGET_PROFILE_DIR}/PERSONA.md"
# 3. Identity & Boundaries
cp "${SCRIPT_DIR}/template_identity.md" "${TARGET_PROFILE_DIR}/IDENTITY.md"
# 4. Durable Memory Facts
cp "${SCRIPT_DIR}/template_memory.md" "${TARGET_PROFILE_DIR}/MEMORY.md"
# 5. Business Context & Catalog
cp "${SCRIPT_DIR}/template_context.md" "${TARGET_PROFILE_DIR}/CONTEXT.md"

echo "✅ Đã tạo thành công 5 lớp tri thức cho Profile [${PROFILE_NAME}]:"
echo "   1. SOUL.md     — Triết lý phục vụ & phụng sự tận gốc"
echo "   2. PERSONA.md  — Văn phong Zalo tự nhiên & chuẩn di động"
echo "   3. IDENTITY.md — Ranh giới vai trò, phân quyền & OPSEC"
echo "   4. MEMORY.md   — Lưu trữ sự thật bền vững về khách hàng"
echo "   5. CONTEXT.md  — Bảng giá, sản phẩm & quy trình kinh doanh"
echo ""
echo "👉 Để kích hoạt profile này với Hermes Agent, hãy chạy:"
echo "   hermes --profile ${PROFILE_NAME}"
echo "🎉 Chúc mừng bạn đã có một Zalo AI Agent chuyên nghiệp và có hồn!"
