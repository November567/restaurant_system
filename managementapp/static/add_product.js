    document.addEventListener('DOMContentLoaded', function () {
        const cancelBtn = document.querySelector('.cancel-btn');
        const backBtn = document.querySelector('.back-btn');

        cancelBtn.addEventListener('click', () => cancelEdit());
        backBtn.addEventListener('click', () => backEdit());

        function cancelEdit() {
            window.location.href = `/menu_management/`;
        }

        function backEdit() {
            window.location.href = `/menu_management/`;
        }
        

    });