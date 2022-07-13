import { useForm, useField } from '@shopify/react-form'
import { CurrencyCode } from '@shopify/react-i18n'
import { Redirect } from '@shopify/app-bridge/actions'
import { useAppBridge } from '@shopify/app-bridge-react'
import { gql } from 'graphql-request'
import { useShopifyMutation } from '../../hooks'

import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
  DiscountMethod,
  MethodCard,
  DiscountStatus,
  RequirementType,
  SummaryCard,
  UsageLimitsCard,
  onBreadcrumbAction,
} from '@shopify/discount-app-components'
import {
  Banner,
  Card,
  Layout,
  Page,
  TextField,
  Stack,
  PageActions,
} from '@shopify/polaris'
import { data } from '@shopify/app-bridge/actions/Modal'

const todaysDate = new Date()
const METAFIELD_NAMESPACE = 'discounts-plus'
const METAFIELD_CONFIGURATION_KEY = 'volume-config'
const FUNCTION_ID = '016ed4f2-d123-43fb-b3db-93b49d5f7662'

const CREATE_AUTOMATIC_MUTATION = gql`
  mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
    discountCreate: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
      userErrors {
        code
        message
        field
      }
    }
  }
`

const CREATE_CODE_MUTATION = gql`
  mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
    discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
      userErrors {
        code
        message
        field
      }
    }
  }
`

export default function VolumeNew() {
  const app = useAppBridge()
  const redirect = Redirect.create(app)
  const currencyCode = CurrencyCode.Cad
  const [createAutoDiscount] = useShopifyMutation({
    query: CREATE_AUTOMATIC_MUTATION,
  })
  const [createCodeDiscount] = useShopifyMutation({
    query: CREATE_CODE_MUTATION,
  })

  const {
    fields: {
      discountTitle,
      discountCode,
      discountMethod,
      combinesWith,
      requirementType,
      requirementSubtotal,
      requirementQuantity,
      usageTotalLimit,
      usageOncePerCustomer,
      startDate,
      endDate,
      configuration,
    },
    submit,
    submitting,
    dirty,
    reset,
    submitErrors,
    makeClean,
  } = useForm({
    fields: {
      discountTitle: useField(''),
      discountMethod: useField(DiscountMethod.Code),
      discountCode: useField(''),
      combinesWith: useField({
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false,
      }),
      requirementType: useField(RequirementType.None),
      requirementSubtotal: useField('0'),
      requirementQuantity: useField('0'),
      usageTotalLimit: useField(null),
      usageOncePerCustomer: useField(false),
      startDate: useField(todaysDate),
      endDate: useField(null),
      configuration: { // Add quantity and percentage configuration
        quantity: useField('1'),
        percentage: useField('0'),
      },
    },
    onSubmit: async (form) => {
      const discount = {
        functionId: FUNCTION_ID,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
        metafields: [
          {
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_CONFIGURATION_KEY,
            type: 'json',
            value: JSON.stringify({
              quantity: parseInt(form.configuration.quantity),
              percentage: parseFloat(form.configuration.percentage),
            }),
          },
        ],
      }
      const { data } = form.discountMethod === DiscountMethod.Automatic ?
        await createAutoDiscount({
          discount: { ...discount, title: form.discountTitle },
        })
        : await createCodeDiscount({
          discount: { ...discount, title: form.discountCode, code: form.discountCode },
        })

      const remoteErrors = data.discountCreate.userErrors
      if (remoteErrors.length > 0) {
        return { status: 'fail', errors: remoteErrors }
      }

      redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
        name: Redirect.ResourceType.Discount,
      })
      return { status: 'success' }
    },
  })

  const errorBanner =
    submitErrors.length > 0 ? (
      <Layout.Section>
        <Banner status="critical">
          <p>There were some issues with your form submission:</p>
          <ul>
            {submitErrors.map(({ message, field }, index) => {
              return (
                <li key={`${message}${index}`}>
                  {field.join('.')} {message}
                </li>
              )
            })}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null

  return (
    <Page
      title="Create volume discount"
      breadcrumbs={[
        {
          content: 'Discounts',
          onAction: () => onBreadcrumbAction(redirect, true),
        },
      ]}
      primaryAction={{
        content: 'Save',
        onAction: submit,
        disabled: !dirty,
        loading: submitting,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <form onSubmit={submit}>
            <MethodCard
              title="Volume"
              discountTitle={discountTitle}
              discountClass={DiscountClass.Product}
              discountCode={discountCode}
              discountMethod={discountMethod}
            />
            <Card title="Volume">
              <Card.Section>
                <Stack>
                  <TextField label="Minimum quantity" {...configuration.quantity} />
                  <TextField label="Discount percentage" {...configuration.percentage} suffix="%" />
                </Stack>
              </Card.Section>
            </Card>
            {discountMethod.value === DiscountMethod.Code && (
              <UsageLimitsCard
                totalUsageLimit={usageTotalLimit}
                oncePerCustomer={usageOncePerCustomer}
              />
            )}
            <CombinationCard
              combinableDiscountTypes={combinesWith}
              discountClass={DiscountClass.Product}
              discountDescriptor={
                discountMethod.value === DiscountMethod.Automatic
                  ? discountTitle.value
                  : discountCode.value
              }
            />
            <ActiveDatesCard
              startDate={startDate}
              endDate={endDate}
              timezoneAbbreviation="EST"
            />
          </form>
        </Layout.Section>
        <Layout.Section secondary>
          <SummaryCard
            header={{
              discountMethod: discountMethod.value,
              discountDescriptor:
                discountMethod.value === DiscountMethod.Automatic
                  ? discountTitle.value
                  : discountCode.value,
              appDiscountType: 'Volume',
              isEditing: false,
            }}
            performance={{
              status: DiscountStatus.Scheduled,
              usageCount: 0,
            }}
            minimumRequirements={{
              requirementType: requirementType.value,
              subtotal: requirementSubtotal.value,
              quantity: requirementQuantity.value,
              currencyCode: currencyCode,
            }}
            usageLimits={{
              oncePerCustomer: usageOncePerCustomer.value,
              totalUsageLimit: usageTotalLimit.value,
            }}
            activeDates={{
              startDate: startDate.value,
              endDate: endDate.value,
            }}
          />
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: 'Save discount',
              onAction: submit,
              disabled: !dirty,
              loading: submitting,
            }}
            secondaryActions={[
              {
                content: 'Discard',
                onAction: () => onBreadcrumbAction(redirect, true),
              },
            ]}
          />
        </Layout.Section>
      </Layout>
    </Page>
  )
}
