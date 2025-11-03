// src/pages/Product/ProductUpdate.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TextField from '../../components/SharedComponents/TextField';
import TabSwitcher from '../../components/SharedComponents/TabSwitcher';
import BinaryRadioGroup from '../../components/SharedComponents/BinaryRadioGroup';
import AsyncSelect from '../../components/SharedComponents/AsyncSelect';

const PRODUCT_OR_SERVICE = [
  { value: 'PRODUCT', label: '실물 상품' },
  { value: 'SERVICE', label: '서비스 상품' },
];

const createDefaultValues = () => ({
  productType: 'PRODUCT',
  productName: '',
  serviceName: '',
  serviceSessionCount: '',
  serviceDurationDays: '',
  salePrice: '',
  saleStatus: 'ACTIVE',
  categoryCode: '',
  memo: '',
  createdAt: new Date().toISOString().slice(0, 10),
});

function ProductUpdate() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState(createDefaultValues);
  const [initialValues, setInitialValues] = useState(createDefaultValues);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isProduct = values.productType === 'PRODUCT';
  const isService = !isProduct;
  const codeAId = isProduct ? 'PRODUCT' : 'SERVICE';
  const isPtService = isService && values.categoryCode === 'PT';
  const isMembershipService = isService && values.categoryCode === 'MEMBERSHIP';

  useEffect(() => {
    let mounted = true; // component가 마운트된 상태인지 추적하여 빈 값이 들어가는 것을 방지

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/v1/product/${productId}`);

        if (!mounted) return;

        const nextValues = {
          ...createDefaultValues(),
          productType: data.productType ?? 'PRODUCT',
          productName: data.productName ?? '',
          serviceName: data.serviceName ?? '',
          serviceSessionCount: data.serviceSessionCount?.toString() ?? '',
          serviceDurationDays: data.serviceDurationDays?.toString() ?? '',
          salePrice: data.salePrice?.toString() ?? '',
          saleStatus: data.saleStatus ?? 'ACTIVE',
          categoryCode: data.categoryCode ?? '',
          memo: data.memo ?? '',
          createdAt: (data.createdAt ?? new Date().toISOString()).slice(0, 10),
        };

        setValues(nextValues);
        setInitialValues(nextValues);
      } catch (error) {
        console.error('상품 정보를 불러오지 못했습니다.', error);
        alert('상품 정보를 가져오는 데 실패했습니다.');
        navigate('/product');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [productId, navigate]);

  const handleTabChange = (nextType) => {
    setValues((prev) => ({
      ...prev,
      productType: nextType,
      categoryCode: '',
      serviceSessionCount: '',
      serviceDurationDays: '',
    }));
  };

  const handleChange = (input, maybeValue) => {
    if (typeof input === 'string') {
      const name = input;
      const value = maybeValue;
      setValues((prev) => ({ ...prev, [name]: value }));
      return;
    }

    const { name, value } = input.target ?? input;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setValues(initialValues);
  };

  const handleCancel = (event) => {
    event.preventDefault();
    navigate('/product');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!productId || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        ...values,
        salePrice: Number(values.salePrice || 0),
        serviceSessionCount: values.serviceSessionCount
          ? Number(values.serviceSessionCount)
          : null,
        serviceDurationDays: values.serviceDurationDays
          ? Number(values.serviceDurationDays)
          : null,
      };

      await axios.put(`/api/v1/product/${productId}`, payload);
      alert('상품 정보가 수정되었습니다.');
      navigate('/product');
    } catch (error) {
      console.error('상품 수정 실패', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>상품 정보를 불러오는 중입니다...</div>;
  }

  return (
    <>
      <h1>{isProduct ? '상품 정보 수정' : '서비스 정보 수정'}</h1>
      <form onSubmit={handleSubmit}>
        <TabSwitcher
          tabs={PRODUCT_OR_SERVICE}
          name="productType"
          activeValue={values.productType}
          value={values.productType}
          onChange={handleTabChange}
        />

        <AsyncSelect
          label={isProduct ? '상품 분류' : '서비스 분류'}
          name="categoryCode"
          value={values.categoryCode}
          onChange={handleChange}
          placeholder={isProduct ? '상품 분류를 선택하세요' : '서비스 분류를 선택하세요'}
          endpoint={`/v1/categories/list/${codeAId}`}
          mapOption={(row) => ({
            value: row.codeBId,
            label: `${row.codeBName} (${row.codeBId})`,
          })}
        />

        <TextField
          label={isProduct ? '상품명' : '서비스명'}
          name={isProduct ? 'productName' : 'serviceName'}
          value={isProduct ? values.productName : values.serviceName}
          onChange={handleChange}
          placeholder={isProduct ? '상품명을 입력하세요' : '서비스명을 입력하세요'}
        />

        <TextField
          label="판매가"
          name="salePrice"
          type="number"
          value={values.salePrice}
          onChange={handleChange}
          placeholder="원 단위 숫자만 입력하세요"
          inputProps={{ min: 0 }}
        />

        <BinaryRadioGroup
          label="판매 상태"
          name="saleStatus"
          value={values.saleStatus}
          onChange={handleChange}
          options={[
            { value: 'ACTIVE', label: '판매중' },
            { value: 'INACTIVE', label: '판매중지' },
          ]}
        />

        {isPtService && (
          <TextField
            label="서비스 이용 횟수"
            name="serviceSessionCount"
            type="number"
            value={values.serviceSessionCount}
            onChange={handleChange}
            placeholder="예: 10 (PT 회차)"
            inputProps={{ min: 0 }}
            helpText="PT 상품일 때만 입력합니다."
          />
        )}

        {isMembershipService && (
          <TextField
            label="서비스 이용 기간(일)"
            name="serviceDurationDays"
            type="number"
            value={values.serviceDurationDays}
            onChange={handleChange}
            placeholder="예: 30 (이용권 일수)"
            inputProps={{ min: 0 }}
            helpText="이용권 상품일 때만 입력합니다."
          />
        )}

        <TextField
          label={isProduct ? '상품 설명' : '서비스 설명'}
          name="memo"
          value={values.memo}
          onChange={handleChange}
          placeholder={isProduct ? '상품에 대한 설명을 입력하세요' : '서비스에 대한 설명을 입력하세요'}
        />

        <TextField
          label="등록일"
          name="createdAt"
          type="date"
          value={values.createdAt}
          onChange={handleChange}
          readOnly
          helpText="등록일은 수정할 수 없습니다."
        />

        <div className="d-flex justify-content-between gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleReset}
          >
            초기화
          </button>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleCancel}
            >
              목록으로
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '수정 중...' : '수정'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default ProductUpdate;
