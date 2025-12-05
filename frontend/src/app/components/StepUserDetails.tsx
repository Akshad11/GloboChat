export default function StepUserDetails({ next, prev, update, form }: any) {

    function goNext(e: any) {
        e.preventDefault();
        if (!form.username || !form.firstname || !form.lastname)
            return alert("Fill all fields");

        next();
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Your Details</h2>

            <form onSubmit={goNext} className="space-y-4">
                <input
                    value={form.username}
                    onChange={(e) => update({ username: e.target.value })}
                    placeholder="Username"
                    className="w-full p-3 border rounded placeholder:text-gray-500"
                />

                <input
                    value={form.firstname}
                    onChange={(e) => update({ firstname: e.target.value })}
                    placeholder="First Name"
                    className="w-full p-3 border rounded placeholder:text-gray-500"
                />

                <input
                    value={form.lastname}
                    onChange={(e) => update({ lastname: e.target.value })}
                    placeholder="Last Name"
                    className="w-full p-3 border rounded placeholder:text-gray-500"
                />

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={prev}
                        className="w-1/2 p-3 bg-gray-500 rounded"
                    >
                        Back
                    </button>

                    <button
                        className="w-1/2 p-3 bg-blue-600 text-white rounded"
                        type="submit"
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
}
