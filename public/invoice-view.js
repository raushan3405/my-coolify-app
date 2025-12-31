document.addEventListener('DOMContentLoaded', async () => {
    const invoiceDetailsContainer = document.getElementById('invoice-details');
    const invoiceId = new URLSearchParams(window.location.search).get('id');

    if (!invoiceId) {
        invoiceDetailsContainer.innerHTML = '<p style="text-align:center; color:red;">No invoice ID provided. <a href="invoices.html">Go back</a>.</p>';
        return;
    }

    function formatCurrency(num) {
        return `₹${parseFloat(num).toFixed(2)}`;
    }

    try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.msg || 'Invoice not found');
        }
        const invoice = await response.json();

        const invoiceHTML = `
            <table>
                <tr class="top">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td class="title">
                                    <img src="" alt="Frmply Logo" style="width:100%; max-width:150px;">
                                </td>
                                <td>
                                    Invoice #: ${invoice.invoice_number}<br>
                                    Created: ${invoice.issue_date}<br>
                                    Due: ${invoice.due_date}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="information">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td>
                                    Frmply, Inc.<br>
                                    123 Your Street<br>
                                    Your City, State 12345
                                </td>
                                <td>
                                    <strong>${invoice.customer_name}</strong><br>
                                    ${invoice.customer_address || ''}<br>
                                    ${invoice.customer_email || ''}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="heading">
                    <td>Item</td>
                    <td>Price</td>
                </tr>
                <tr class="item">
                    <td>${invoice.service_name} (Govt. Cost)</td>
                    <td>${formatCurrency(invoice.govt_cost)}</td>
                </tr>
                <tr class="item">
                    <td>${invoice.service_name} (Service Cost)</td>
                    <td>${formatCurrency(invoice.service_cost)}</td>
                </tr>
                <tr class="total">
                    <td></td>
                    <td>Subtotal: ${formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr class="total">
                    <td></td>
                    <td>Tax (${invoice.tax_rate}%): ${formatCurrency(invoice.tax_amount)}</td>
                </tr>
                <tr class="total">
                    <td></td>
                    <td><strong>Grand Total: ${formatCurrency(invoice.grand_total)}</strong></td>
                </tr>
            </table>
        `;

        invoiceDetailsContainer.innerHTML = invoiceHTML;

    } catch (error) {
        console.error('Failed to load invoice:', error);
        invoiceDetailsContainer.innerHTML = `<p style="text-align:center; color:red;">Error: ${error.message}</p>`;
    }
});
